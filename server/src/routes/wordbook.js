const express = require('express');
const { getDb, getWord, upsertWordbook, removeWordbook } = require('../db');
const { isDue } = require('../services/memory');
const { LEVEL_LABELS } = require('../seed/words');

const router = express.Router();

const STATUS_LABELS = {
  new: '生词本',
  mastered: '已掌握',
  favorite: '收藏'
};

function joinWord(entry) {
  const w = getWord(entry.wordId);
  if (!w) return null;
  return {
    ...entry,
    statusLabel: STATUS_LABELS[entry.status] || entry.status,
    due: isDue(entry),
    word: {
      id: w.id,
      word: w.word,
      pos: w.pos,
      meanings: w.meanings,
      phoneticUK: w.phoneticUK,
      phoneticUS: w.phoneticUS,
      level: w.level,
      levelLabel: LEVEL_LABELS[w.level] || w.level,
      exams: w.exams
    }
  };
}

router.get('/stats', (req, res) => {
  const db = getDb();
  const entries = Object.values(db.wordbook);
  res.json({
    total: entries.length,
    new: entries.filter((e) => e.status === 'new').length,
    mastered: entries.filter((e) => e.status === 'mastered').length,
    favorite: entries.filter((e) => e.status === 'favorite').length,
    dueToday: entries.filter(isDue).length
  });
});

router.get('/', (req, res) => {
  const db = getDb();
  const { status, due } = req.query;
  let entries = Object.values(db.wordbook);
  if (status) entries = entries.filter((e) => e.status === status);
  if (due === 'true') entries = entries.filter(isDue);

  const items = entries
    .map(joinWord)
    .filter(Boolean)
    .sort((a, b) => (b.addedAt || '').localeCompare(a.addedAt || ''));
  res.json({ total: items.length, items });
});

router.post('/', (req, res) => {
  const { wordId, status } = req.body || {};
  if (!wordId || !getWord(wordId)) return res.status(404).json({ error: '单词不存在' });
  const valid = ['new', 'mastered', 'favorite'];
  if (status && !valid.includes(status)) return res.status(400).json({ error: '状态无效' });
  const entry = upsertWordbook(wordId, status || 'new');
  res.status(201).json(joinWord(entry));
});

router.patch('/:wordId', (req, res) => {
  const { status } = req.body || {};
  const valid = ['new', 'mastered', 'favorite'];
  if (!status || !valid.includes(status)) return res.status(400).json({ error: '状态无效' });
  if (!getWord(req.params.wordId)) return res.status(404).json({ error: '单词不存在' });
  const entry = upsertWordbook(req.params.wordId, status);
  res.json(joinWord(entry));
});

router.delete('/:wordId', (req, res) => {
  const existed = removeWordbook(req.params.wordId);
  if (!existed) return res.status(404).json({ error: '记录不存在' });
  res.json({ ok: true });
});

module.exports = router;
