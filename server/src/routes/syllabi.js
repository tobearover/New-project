const express = require('express');
const { getDb } = require('../db');
const { LEVEL_LABELS } = require('../seed/words');

const router = express.Router();

// 考纲列表（含各考纲词库统计）
router.get('/', (req, res) => {
  const db = getDb();
  const list = db.syllabi.map((s) => {
    const wordsOfExam = db.words.filter((w) => w.exams.includes(s.id));
    const levels = {};
    for (const key of Object.keys(LEVEL_LABELS)) {
      levels[key] = wordsOfExam.filter((w) => w.level === key).length;
    }
    return {
      ...s,
      stats: {
        total: wordsOfExam.length,
        levels,
        phrases: db.phrases.filter((p) => p.exams.includes(s.id)).length
      }
    };
  });
  res.json(list);
});

module.exports = router;
