const express = require('express');
const { getDb, wordbookEntry } = require('../db');
const { LEVEL_LABELS } = require('../seed/words');

const router = express.Router();

function summary(w) {
  return {
    id: w.id,
    word: w.word,
    pos: w.pos,
    meanings: w.meanings,
    phoneticUK: w.phoneticUK,
    phoneticUS: w.phoneticUS,
    level: w.level,
    levelLabel: LEVEL_LABELS[w.level] || w.level,
    exams: w.exams,
    // 供单词列表手风琴展开直接展示（避免每条都发起详情请求）
    examples: (w.examples || []).slice(0, 2),
    collocations: (w.collocations || []).slice(0, 4),
    synonyms: (w.synonyms || []).slice(0, 4)
  };
}

// 单词列表/搜索：?syllabus=cet4&level=high_frequency&q=ab&limit=100&offset=0
router.get('/', (req, res) => {
  const db = getDb();
  const { syllabus, level, q } = req.query;
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const offset = parseInt(req.query.offset, 10) || 0;

  let list = db.words;
  if (syllabus) list = list.filter((w) => w.exams.includes(syllabus));
  if (level) list = list.filter((w) => w.level === level);
  if (q) {
    const kw = q.trim().toLowerCase();
    list = list.filter((w) => w.word.toLowerCase().includes(kw));
  }

  const total = list.length;
  const page = list.slice(offset, offset + limit).map((w) => ({
    ...summary(w),
    status: wordbookEntry(w.id)?.status || null
  }));
  res.json({ total, offset, limit, items: page });
});

// 单词详情（含生词本状态与相关推荐）
router.get('/:id', (req, res) => {
  const db = getDb();
  const w = db.words.find((x) => x.id === req.params.id);
  if (!w) return res.status(404).json({ error: '单词不存在' });

  const wb = wordbookEntry(w.id);
  const related = [];
  const seen = new Set([w.id]);

  // 同义/反义/派生词中存在于词库的词
  const candidateNames = [...(w.synonyms || []), ...(w.antonyms || []), ...(w.derivatives || [])];
  for (const name of candidateNames) {
    const base = name.split(' ')[0].toLowerCase();
    const match = db.words.find((x) => x.word.toLowerCase() === base);
    if (match && !seen.has(match.id)) {
      seen.add(match.id);
      related.push({ ...summary(match), relation: '近义/反义/派生' });
    }
    if (related.length >= 5) break;
  }

  // 同考纲同级别推荐
  if (related.length < 6) {
    const samePool = db.words.filter(
      (x) =>
        !seen.has(x.id) &&
        x.level === w.level &&
        x.exams.some((e) => w.exams.includes(e))
    );
    for (const m of samePool) {
      if (related.length >= 6) break;
      seen.add(m.id);
      related.push({ ...summary(m), relation: '同考纲推荐' });
    }
  }

  // 同考纲词组
  const relatedPhrases = db.phrases.filter((p) =>
    p.exams.some((e) => w.exams.includes(e))
  ).slice(0, 4);

  res.json({
    ...w,
    status: wb ? wb.status : null,
    reviewInfo: wb
      ? {
          reviewCount: wb.reviewCount,
          nextReview: wb.nextReview,
          intervalIndex: wb.intervalIndex
        }
      : null,
    related,
    relatedPhrases
  });
});

module.exports = router;
