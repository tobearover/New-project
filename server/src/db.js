const fs = require('fs');
const path = require('path');
const { syllabi } = require('./seed/syllabi');
const { words, phrases } = require('./seed/words');
const { buildMergedRuntimeWords } = require('./seed/mergedAdapter');

const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const DB_VERSION = 2;

let db = null;

/** 完整词库 = 现有 words.js（400 个精编词条）+ 开源词库合并新增（约 2.4 万） */
function buildSeedWords() {
  return [...words, ...buildMergedRuntimeWords(words)];
}

function defaultDb() {
  return {
    meta: {
      version: DB_VERSION,
      seededAt: new Date().toISOString(),
      wordsCount: 0
    },
    syllabi,
    words: buildSeedWords(),
    phrases,
    wordbook: {}, // wordId -> { status, addedAt, updatedAt, reviewCount, intervalIndex, nextReview, lastReviewed }
    quizHistory: []
  };
}

/**
 * 持久化仅保存用户状态（meta / wordbook / quizHistory），
 * 词库始终在启动时从种子文件构建，避免把 2.4 万词反复写入 db.json。
 */
function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const state = {
    meta: { ...db.meta, wordsCount: db.words.length },
    wordbook: db.wordbook,
    quizHistory: db.quizHistory
  };
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(tmp, DB_PATH);
}

function load() {
  if (!fs.existsSync(DB_PATH)) {
    db = defaultDb();
    save();
    return db;
  }

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (err) {
    console.warn(`[警告] db.json 读取失败（${err.message}），将重建数据库`);
    raw = {};
  }

  // 词库从种子重建；仅迁移用户状态（兼容旧版 db.json）
  db = defaultDb();
  db.meta = {
    version: DB_VERSION,
    seededAt: db.meta.seededAt,
    wordsCount: db.words.length,
    migratedFrom: raw.meta && raw.meta.version
  };
  db.wordbook = raw.wordbook || {};
  db.quizHistory = Array.isArray(raw.quizHistory) ? raw.quizHistory : [];
  save(); // 立即落盘为 v2 状态文件（不含大词库）
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
