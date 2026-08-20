const express = require('express');
const { getDb, getWord, upsertWordbook } = require('../db');

const router = express.Router();

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample(arr, n) {
  return shuffle(arr).slice(0, n);
}

function pickDistractors(pool, correctWord, n) {
  return sample(
    pool.filter((w) => w.id !== correctWord.id && w.word !== correctWord.word),
    n
  );
}

function buildQuestion(type, word, pool) {
  const base = {
    id: `${type}-${word.id}`,
    type,
    word: word.word,
    wordId: word.id
  };

  if (type === 'spelling') {
    return {
      ...base,
      prompt: `${word.pos} ${word.meanings.join('；')}`,
      audio: false,
      options: [],
      answer: word.word
    };
  }

  if (type === 'exam' && word.realExam && word.realExam.length) {
    const { sentence } = word.realExam[0];
    const blanked = sentence.replace(
      new RegExp(`\\b${word.word}\\b`, 'i'),
      '______'
    );
    const distractors = pickDistractors(pool, word, 3);
    const options = shuffle([
      { id: word.id, text: word.word, correct: true },
      ...distractors.map((w) => ({ id: w.id, text: w.word, correct: false }))
    ]);
    return {
      ...base,
      prompt: blanked,
      audio: false,
      options,
      answer: word.word
    };
  }

  // meaning / listening 共用：给词选义 / 听词选义
  const distractors = pickDistractors(pool, word, 3);
  const options = shuffle([
    { id: word.id, text: word.meanings.join('；'), correct: true },
    ...distractors.map((w) => ({ id: w.id, text: w.meanings.join('；'), correct: false }))
  ]);
  return {
    ...base,
    prompt: word.word,
    audio: type === 'listening',
    options,
    answer: word.word
  };
}

// 生成测验：?type=meaning|spelling|listening|exam&syllabus=cet4&count=8
router.get('/', (req, res) => {
  const db = getDb();
  const type = req.query.type || 'meaning';
  const syllabus = req.query.syllabus || 'cet4';
  const count = Math.min(parseInt(req.query.count, 10) || 8, 20);

  if (!['meaning', 'spelling', 'listening', 'exam'].includes(type)) {
    return res.status(400).json({ error: 'type 无效' });
  }

  let pool = db.words.filter((w) => w.exams.includes(syllabus));
  if (type === 'exam') pool = pool.filter((w) => w.realExam && w.realExam.length);
  if (pool.length < 4) return res.status(404).json({ error: '该考纲词库不足，无法出题' });

  const levelRank = { high_frequency: 0, frequent: 1, key: 2, cognition: 3 };
  const sorted = [...pool].sort(
    (a, b) => (levelRank[a.level] ?? 9) - (levelRank[b.level] ?? 9)
  );
  const selected = sample(sorted, Math.min(count, pool.length));
  const questions = selected.map((w) => buildQuestion(type, w, pool));

  res.json({ type, syllabus, total: questions.length, questions });
});

// 提交答案：{ wordId, questionType, correct }；答错自动收入错题本
router.post('/answer', (req, res) => {
  const { wordId, questionType, correct } = req.body || {};
  const db = getDb();
  if (!wordId || !getWord(wordId)) return res.status(404).json({ error: '单词不存在' });

  db.quizHistory.push({
    wordId,
    questionType,
    correct: !!correct,
    answeredAt: new Date().toISOString()
  });

  let wrongAdded = false;
  if (!correct) {
    const existing = db.wordbook[wordId];
    if (!existing || existing.status !== 'new') {
      upsertWordbook(wordId, 'new');
      wrongAdded = true;
    }
  }

  res.json({ ok: true, recorded: true, wrongAdded });
});

module.exports = router;
