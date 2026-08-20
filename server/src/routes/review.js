const express = require('express');
const { getDb, getWord, upsertWordbook } = require('../db');
const { isDue, applyResult, todayStr } = require('../services/memory');

const router = express.Router();

function join(entry) {
  const w = getWord(entry.wordId);
  if (!w) return null;
  return {
    ...entry,
    word: {
      id: w.id,
      word: w.word,
      pos: w.pos,
      meanings: w.meanings,
      phoneticUK: w.phoneticUK,
      phoneticUS: w.phoneticUS,
      level: w.level,
      examples: w.examples
    }
  };
}

// 到期复习列表（生词本中 nextReview <= 今天）
router.get('/due', (req, res) => {
  const db = getDb();
  const items = Object.values(db.wordbook)
    .filter(isDue)
    .map(join)
    .filter(Boolean);
  res.json({ today: todayStr(), total: items.length, items });
});

// 完成一次复习：{ wordId, result: again|good|easy }
router.post('/complete', (req, res) => {
  const { wordId, result } = req.body || {};
  const db = getDb();
  const entry = db.wordbook[wordId];
  if (!entry) return res.status(404).json({ error: '该单词不在生词本中' });
  if (!['again', 'good', 'easy'].includes(result)) {
    return res.status(400).json({ error: 'result 必须是 again/good/easy' });
  }
  const updated = upsertWordbook(wordId, entry.status, applyResult(entry, result));
  res.json(join(updated));
});

module.exports = router;
