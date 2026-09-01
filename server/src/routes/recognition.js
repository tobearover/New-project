const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { getDb, save, pushHistory } = require('../db');
const { recognizeImage } = require('../services/ocr');
const { extractAndMatch } = require('../services/extractor');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// 重复识别检测时间窗口（分钟），可通过环境变量覆盖
const DEDUP_WINDOW_MIN = parseInt(process.env.RECOGNITION_DEDUP_WINDOW_MIN || '30', 10);
// 历史列表单次返回上限（仅分页限制，不做存储清理；历史永久保留直至用户手动删除）
const LIST_LIMIT = 50;

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/** 规范化文本：小写 + 折叠空白，保证同一内容的不同排版得到同一哈希 */
function normalizeForDedup(text) {
  return String(text).trim().toLowerCase().replace(/\s+/g, ' ');
}

/** 识别内容的去重键 = hash(规范化文本 + 考纲)，同一内容换考纲视为不同处理 */
function dedupKey(text, syllabus) {
  return sha256(`${normalizeForDedup(text)}|${syllabus || ''}`);
}

/** 在时间窗口内查找同内容的识别记录 */
function findDuplicate(dbRef, key, userId) {
  const cutoff = Date.now() - DEDUP_WINDOW_MIN * 60000;
  return (
    (dbRef.history || []).find(
      (r) =>
        r.type === 'recognition' &&
        r.userId === userId &&
        r.key === key &&
        new Date(r.createdAt).getTime() >= cutoff
    ) || null
  );
}

/** 历史记录摘要（不包含完整匹配结果，避免 db.json 膨胀） */
function toSummary(record) {
  return {
    id: record.id,
    createdAt: record.createdAt,
    engine: record.engine,
    fallback: !!record.fallback,
    syllabus: record.syllabus,
    matchedCount: record.matchedCount,
    phraseCount: record.phraseCount || 0,
    matchedWords: record.matchedWords || [],
    // 列表展示只带原文摘要，完整原文保留在记录中供详情查看
    rawText: (record.rawText || '').slice(0, 500)
  };
}

function duplicateResponse(previous) {
  const minutes = Math.max(
    1,
    Math.round((Date.now() - new Date(previous.createdAt).getTime()) / 60000)
  );
  return {
    duplicate: true,
    message: `检测到重复识别：该内容 ${minutes} 分钟前已被识别过，已自动跳过重复处理。`,
    windowMinutes: DEDUP_WINDOW_MIN,
    previous: toSummary(previous)
  };
}

/**
 * 拍照/图片导入识别：multipart/form-data，字段 image；可用 mockText 直接传题目文本。
 * 支持 force=true 强制重新识别（跳过重复检测）。
 */
router.post('/', upload.single('image'), async (req, res) => {
  const { syllabus, mockText } = req.body || {};
  const force = req.body && (req.body.force === 'true' || req.body.force === '1');
  const db = getDb();

  let ocrResult = null;
  let imageFastKey = null;

  if (mockText && mockText.trim()) {
    ocrResult = { text: mockText.trim(), engine: 'demo' };
  } else if (req.file) {
    // 图片字节哈希作为快速去重键：同一张图片重复上传时无需再跑 OCR
    imageFastKey = dedupKey('img:' + sha256(req.file.buffer), syllabus);
    if (!force) {
      const dup = findDuplicate(db, imageFastKey, req.user.id);
      if (dup) return res.json(duplicateResponse(dup));
    }
    try {
      ocrResult = await recognizeImage(req.file.buffer);
    } catch (err) {
      // 识别失败：返回可读错误与重试标记，禁止静默回退演示文本
      return res.status(502).json({
        error: err.message || '图片识别失败',
        retryable: true,
        ocr: { engine: 'aliyun' }
      });
    }
  } else {
    return res.status(400).json({ error: '请上传图片或提供 mockText' });
  }

  // 文本哈希去重：不同图片但 OCR 结果相同（或同一段 mockText）也能被识别为重复；
  // 命中仅作重复提示，不删除任何存储记录
  const textKey = dedupKey(ocrResult.text, syllabus);
  if (!force) {
    const dup = findDuplicate(db, textKey, req.user.id);
    if (dup) return res.json(duplicateResponse(dup));
  }

  const matched = extractAndMatch({
    text: ocrResult.text,
    words: db.words,
    phrases: db.phrases,
    syllabusId: syllabus || null,
    wordbook: db.wordbook
  });

  // 记录本次识别（同一内容强制重识别时会新增记录，最新记录用于后续去重）
  const record = pushHistory({
    type: 'recognition',
    userId: req.user.id,
    key: textKey,
    syllabus: syllabus || null,
    engine: ocrResult.engine,
    fallback: !!ocrResult.fallback,
    matchedCount: matched.stats.matchedWords,
    phraseCount: matched.stats.matchedPhrases,
    matchedWords: Object.values(matched.groups).flat().map((w) => w.word),
    rawText: ocrResult.text // 保存完整原文，历史详情据此重新提取结果
  });
  save();

  res.json({
    syllabus: syllabus || null,
    engine: ocrResult.engine,
    fallback: ocrResult.fallback || false,
    reason: ocrResult.reason || null,
    rawText: ocrResult.text,
    historyId: record.id,
    recognizedAt: record.createdAt,
    duplicate: false,
    windowMinutes: DEDUP_WINDOW_MIN,
    ...matched
  });
});

/** 识别历史列表（默认最近 20 条） */
router.get('/history', (req, res) => {
  const db = getDb();
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, LIST_LIMIT);
  const recognitions = db.history
    .filter((r) => r.type === 'recognition' && r.userId === req.user.id)
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
    .reverse();
  const items = recognitions.slice(0, limit).map(toSummary);
  res.json({ total: recognitions.length, windowMinutes: DEDUP_WINDOW_MIN, items });
});

/**
 * 历史识别详情：用记录中的完整原文 + 当前词库/生词本状态重新提取，
 * 返回与实时识别一致的结果结构（不保存完整分组结果，避免 db.json 膨胀）。
 */
router.get('/history/:id', (req, res) => {
  const db = getDb();
  const record = (db.history || []).find(
    (r) => r.type === 'recognition' && r.id === req.params.id && r.userId === req.user.id
  );
  if (!record) return res.status(404).json({ error: '识别记录不存在或已被删除' });

  const matched = extractAndMatch({
    text: record.rawText || '',
    words: db.words,
    phrases: db.phrases,
    syllabusId: record.syllabus || null,
    wordbook: db.wordbook
  });

  res.json({
    syllabus: record.syllabus || null,
    engine: record.engine,
    fallback: !!record.fallback,
    rawText: record.rawText || '',
    historyId: record.id,
    recognizedAt: record.createdAt,
    duplicate: false,
    windowMinutes: DEDUP_WINDOW_MIN,
    ...matched
  });
});

/** 清空识别历史 */
router.delete('/history', (req, res) => {
  const db = getDb();
  db.history = (db.history || []).filter(
    (r) => !(r.type === 'recognition' && r.userId === req.user.id)
  );
  save();
  res.json({ ok: true });
});

module.exports = router;
