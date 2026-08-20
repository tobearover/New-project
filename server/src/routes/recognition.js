const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { getDb, save } = require('../db');
const { recognizeImage, demoResult } = require('../services/ocr');
const { extractAndMatch } = require('../services/extractor');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// 重复识别检测时间窗口（分钟），可通过环境变量覆盖
const DEDUP_WINDOW_MIN = parseInt(process.env.RECOGNITION_DEDUP_WINDOW_MIN || '30', 10);
// 历史记录上限，超出后仅保留最新记录
const MAX_HISTORY = parseInt(process.env.RECOGNITION_HISTORY_MAX || '100', 10);

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

/** 清理策略：删除超出时间窗口的旧记录，并限制总条数上限 */
function purgeHistory(dbRef) {
  const cutoff = Date.now() - DEDUP_WINDOW_MIN * 60000;
  dbRef.recognitionHistory = (dbRef.recognitionHistory || []).filter(
    (r) => new Date(r.createdAt).getTime() >= cutoff
  );
  if (dbRef.recognitionHistory.length > MAX_HISTORY) {
    dbRef.recognitionHistory = dbRef.recognitionHistory.slice(-MAX_HISTORY);
  }
}

/** 在时间窗口内查找同内容的识别记录 */
function findDuplicate(dbRef, key) {
  const cutoff = Date.now() - DEDUP_WINDOW_MIN * 60000;
  return (
    (dbRef.recognitionHistory || []).find(
      (r) => r.key === key && new Date(r.createdAt).getTime() >= cutoff
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
    rawText: record.rawText || ''
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

  purgeHistory(db);

  let ocrResult = null;
  let imageFastKey = null;

  if (mockText && mockText.trim()) {
    ocrResult = { text: mockText.trim(), engine: 'demo' };
  } else if (req.file) {
    // 图片字节哈希作为快速去重键：同一张图片重复上传时无需再跑 OCR
    imageFastKey = dedupKey('img:' + sha256(req.file.buffer), syllabus);
    if (!force) {
      const dup = findDuplicate(db, imageFastKey);
      if (dup) return res.json(duplicateResponse(dup));
    }
    ocrResult = await recognizeImage(req.file.buffer);
    if (!ocrResult.text) {
      const fallback = demoResult();
      ocrResult = { ...fallback, fallback: true, reason: ocrResult.error || '识别失败' };
    }
  } else {
    return res.status(400).json({ error: '请上传图片或提供 mockText' });
  }

  // 文本哈希去重：不同图片但 OCR 结果相同（或同一段 mockText）也能被识别为重复
  // 注意：OCR 失败回退的演示文本不代表真实内容，跳过文本级去重，仅保留图片字节级去重
  const textKey = dedupKey(ocrResult.text, syllabus);
  if (!force && !ocrResult.fallback) {
    const dup = findDuplicate(db, textKey);
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
  const record = {
    id: crypto.randomUUID(),
    key: textKey,
    syllabus: syllabus || null,
    engine: ocrResult.engine,
    fallback: !!ocrResult.fallback,
    createdAt: new Date().toISOString(),
    matchedCount: matched.stats.matchedWords,
    phraseCount: matched.stats.matchedPhrases,
    matchedWords: Object.values(matched.groups).flat().map((w) => w.word),
    rawText: ocrResult.text.slice(0, 500)
  };
  db.recognitionHistory.push(record);
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
  purgeHistory(db);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, MAX_HISTORY);
  const items = db.recognitionHistory.slice(-limit).reverse().map(toSummary);
  res.json({ total: db.recognitionHistory.length, windowMinutes: DEDUP_WINDOW_MIN, items });
});

/** 清空识别历史 */
router.delete('/history', (req, res) => {
  const db = getDb();
  db.recognitionHistory = [];
  save();
  res.json({ ok: true });
});

module.exports = router;
