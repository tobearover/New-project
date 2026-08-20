const fs = require('fs');
const path = require('path');
const { syllabi } = require('./seed/syllabi');
const { words, phrases } = require('./seed/words');

const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DB_PATH = path.join(DATA_DIR, 'db.json');

let db = null;

function defaultDb() {
  return {
    meta: {
      version: 1,
      seededAt: new Date().toISOString(),
      note: 'MVP JSON 数据存储；生产环境建议迁移至 MongoDB/MySQL'
    },
    syllabi,
    words,
    phrases,
    wordbook: {}, // wordId -> { status, addedAt, updatedAt, reviewCount, intervalIndex, nextReview, lastReviewed }
    quizHistory: []
  };
}

function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, DB_PATH);
}

function load() {
  if (!fs.existsSync(DB_PATH)) {
    db = defaultDb();
    save();
    return db;
  }
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  db = JSON.parse(raw);
  // 种子数据升级时补充新词条（不去重，简单合并）
  const known = new Set(db.words.map((w) => w.id));
  const fresh = words.filter((w) => !known.has(w.id));
  if (fresh.length) {
    db.words = [...db.words, ...fresh];
    save();
  }
  return db;
}

function ensureDb() {
  return db || load();
}

function getDb() {
  return ensureDb();
}

function getWord(wordId) {
  return ensureDb().words.find((w) => w.id === wordId);
}

function wordbookEntry(wordId) {
  return ensureDb().wordbook[wordId] || null;
}

function upsertWordbook(wordId, status, patch = {}) {
  const dbRef = ensureDb();
  const now = new Date().toISOString();
  const existing = dbRef.wordbook[wordId];
  dbRef.wordbook[wordId] = {
    wordId,
    status: status || existing?.status || 'new',
    addedAt: existing?.addedAt || now,
    updatedAt: now,
    reviewCount: existing?.reviewCount || 0,
    intervalIndex: existing?.intervalIndex ?? 0,
    nextReview: existing?.nextReview || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    lastReviewed: existing?.lastReviewed || null,
    ...patch
  };
  save();
  return dbRef.wordbook[wordId];
}

function removeWordbook(wordId) {
  const dbRef = ensureDb();
  const existed = !!dbRef.wordbook[wordId];
  delete dbRef.wordbook[wordId];
  if (existed) save();
  return existed;
}

module.exports = {
  DATA_DIR,
  UPLOAD_DIR,
  DB_PATH,
  ensureDb,
  getDb,
  save,
  getWord,
  wordbookEntry,
  upsertWordbook,
  removeWordbook
};
