const express = require('express');
const { getDb, save, removeHistory } = require('../db');
const { extractAndMatch } = require('../services/extractor');

const router = express.Router();
const MAX_PAGE_SIZE = 100;
const VALID_TYPES = ['recognition', 'quiz', 'wordbook'];

/** 列表摘要：识别记录原文截断展示，完整原文保留在记录中 */
function summarize(record) {
  const base = { id: record.id, type: record.type, createdAt: record.createdAt };
  if (record.type === 'recognition') {
    return {
      ...base,
      engine: record.engine,
      fallback: !!record.fallback,
      syllabus: record.syllabus,
      matchedCount: record.matchedCount || 0,
      phraseCount: record.phraseCount || 0,
      matchedWords: record.matchedWords || [],
      rawText: (record.rawText || '').slice(0, 200)
    };
  }
  if (record.type === 'quiz') {
    return {
      ...base,
      word: record.word,
      wordId: record.wordId,
      questionType: record.questionType,
      correct: !!record.correct
    };
  }
  return {
    ...base,
    word: record.word,
    wordId: record.wordId,
    action: record.action,
    status: record.status
  };
}

// 历史列表：?type=recognition|quiz|wordbook&offset=0&limit=20，按时间倒序
router.get('/', (req, res) => {
  const db = getDb();
  const type = req.query.type;
  if (type && !VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'type 无效' });
  }
  const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, MAX_PAGE_SIZE);

  const items = db.history
    .filter((h) => h.userId === req.user.id && (!type || h.type === type))
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
    .reverse();

  res.json({
    total: items.length,
    offset,
    limit,
    items: items.slice(offset, offset + limit).map(summarize)
  });
});

// 单条详情：识别记录返回完整结果（用完整原文重新提取），其余类型返回原始记录
router.get('/:id', (req, res) => {
  const db = getDb();
  const record = (db.history || []).find(
    (h) => h.id === req.params.id && h.userId === req.user.id
  );
  if (!record) return res.status(404).json({ error: '记录不存在或已被删除' });

  if (record.type === 'recognition') {
    const matched = extractAndMatch({
      text: record.rawText || '',
      words: db.words,
      phrases: db.phrases,
      syllabusId: record.syllabus || null,
      wordbook: db.wordbook
    });
    return res.json({
      ...summarize(record),
      rawText: record.rawText || '',
      stats: matched.stats,
      groups: matched.groups,
      orderedGroups: matched.order,
      phrases: matched.phrases
    });
  }
  res.json(record);
});

// 单条删除
router.delete('/:id', (req, res) => {
  const existed = removeHistory(req.user.id, req.params.id);
  if (!existed) return res.status(404).json({ error: '记录不存在或已被删除' });
  save();
  res.json({ ok: true });
});

// 批量删除：DELETE /api/history，body: { ids: [...] }
router.delete('/', (req, res) => {
  const ids = (req.body && Array.isArray(req.body.ids) ? req.body.ids : []).filter(Boolean);
  if (!ids.length) return res.status(400).json({ error: '请提供要删除的记录 id 列表' });
  const db = getDb();
  const before = db.history.length;
  db.history = db.history.filter((h) => !(h.userId === req.user.id && ids.includes(h.id)));
  const removed = before - db.history.length;
  save();
  res.json({ ok: true, removed });
});

module.exports = router;
