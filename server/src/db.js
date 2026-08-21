const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { syllabi } = require('./seed/syllabi');
const { words, phrases } = require('./seed/words');
const { buildMergedRuntimeWords, enrichCuratedWords } = require('./seed/mergedAdapter');

const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const DB_VERSION = 3;
// 统一历史记录上限（超出后丢弃最旧记录，避免无界增长）
const HISTORY_MAX = 5000;

let db = null;

/** 完整词库 = 现有 words.js（400 个精编词条）+ 开源词库合并新增（约 2.4 万） */
function buildSeedWords() {
  // 精编词条先经开源数据回流富化（例句/同反义/搭配/真题），再与合并词条拼接
  const enriched = enrichCuratedWords(words);
  return [...enriched, ...buildMergedRuntimeWords(enriched)];
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
    // 统一历史记录：识别 / 测验 / 生词本操作，均带 userId（当前单用户默认 local，
    // 接入登录体系后按账号隔离即可）
    history: []
  };
}

/**
 * 持久化仅保存用户状态（meta / wordbook / history），
 * 词库始终在启动时从种子文件构建，避免把 2.4 万词反复写入 db.json。
 */
function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const state = {
    meta: { ...db.meta, wordsCount: db.words.length },
    wordbook: db.wordbook,
    history: db.history
  };
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(tmp, DB_PATH);
}

/** 兼容旧版（v1/v2）数据库：recognitionHistory / quizHistory 合并迁移为统一 history */
function migrateHistory(raw, dbRef) {
  const migrated = [];
  const seen = new Set();

  for (const r of raw.recognitionHistory || []) {
    if (!r || !r.id || seen.has(r.id)) continue;
    seen.add(r.id);
    migrated.push({
      id: r.id,
      userId: 'local',
      type: 'recognition',
      createdAt: r.createdAt,
      key: r.key,
      syllabus: r.syllabus || null,
      engine: r.engine,
      fallback: !!r.fallback,
      matchedCount: r.matchedCount || 0,
      phraseCount: r.phraseCount || 0,
      matchedWords: r.matchedWords || [],
      rawText: r.rawText || ''
    });
  }

  for (const q of raw.quizHistory || []) {
    if (!q || !q.answeredAt) continue;
    const id = crypto.randomUUID();
    if (seen.has(id)) continue;
    seen.add(id);
    const w = dbRef.words.find((x) => x.id === q.wordId);
    migrated.push({
      id,
      userId: 'local',
      type: 'quiz',
      createdAt: q.answeredAt,
      wordId: q.wordId,
      word: w ? w.word : q.wordId,
      questionType: q.questionType,
      correct: !!q.correct
    });
  }

  migrated.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  return migrated;
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

  if (Array.isArray(raw.history)) {
    db.history = raw.history;
  } else {
    db.history = migrateHistory(raw, db);
  }
  // 统一裁剪：保留最近 HISTORY_MAX 条
  db.history = db.history.slice(-HISTORY_MAX);
  save(); // 立即落盘为新版状态文件（不含大词库）
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

/** 追加一条统一历史记录并裁剪上限 */
function pushHistory(entry) {
  const dbRef = ensureDb();
  dbRef.history.push({
    id: crypto.randomUUID(),
    userId: 'local',
    createdAt: new Date().toISOString(),
    ...entry
  });
  if (dbRef.history.length > HISTORY_MAX) {
    dbRef.history = dbRef.history.slice(-HISTORY_MAX);
  }
  return dbRef.history[dbRef.history.length - 1];
}

function removeHistory(id) {
  const dbRef = ensureDb();
  const idx = dbRef.history.findIndex((h) => h.id === id);
  if (idx < 0) return false;
  dbRef.history.splice(idx, 1);
  return true;
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
  HISTORY_MAX,
  ensureDb,
  getDb,
  save,
  getWord,
  wordbookEntry,
  pushHistory,
  removeHistory,
  upsertWordbook,
  removeWordbook
};
