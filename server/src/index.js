const express = require('express');
const cors = require('cors');
const { ensureDb } = require('./db');

const syllabiRouter = require('./routes/syllabi');
const wordsRouter = require('./routes/words');
const authRouter = require('./routes/auth');
const recognitionRouter = require('./routes/recognition');
const historyRouter = require('./routes/history');
const wordbookRouter = require('./routes/wordbook');
const reviewRouter = require('./routes/review');
const quizRouter = require('./routes/quiz');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  const db = ensureDb();
  res.json({
    ok: true,
    time: new Date().toISOString(),
    stats: {
      syllabi: db.syllabi.length,
      words: db.words.length,
      phrases: db.phrases.length
    }
  });
});

app.use('/api/auth', authRouter);
app.use('/api/syllabi', syllabiRouter);
app.use('/api/words', wordsRouter);
app.use('/api/recognition', requireAuth, recognitionRouter);
app.use('/api/history', requireAuth, historyRouter);
app.use('/api/wordbook', requireAuth, wordbookRouter);
app.use('/api/review', requireAuth, reviewRouter);
app.use('/api/quiz', quizRouter); // POST /answer 内部单独鉴权

app.use((req, res) => res.status(404).json({ error: '接口不存在' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || '服务器内部错误' });
});

app.listen(PORT, () => {
  const db = ensureDb();
  console.log(`SmartVocab API 已启动：http://localhost:${PORT}`);
  console.log(`词库规模：${db.syllabi.length} 个考纲 / ${db.words.length} 个单词 / ${db.phrases.length} 个词组`);
});
