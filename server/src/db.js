const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { syllabi } = require('./seed/syllabi');
const { words, phrases } = require('./seed/words');
const { buildMergedRuntimeWords, enrichCuratedWords } = require('./seed/mergedAdapter');

const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const DB_VERSION = 4;
// 统一历史记录上限（超出后丢弃最旧记录，避免无界增长）
const HISTORY_MAX = 5000;

let db = null;

/** 完整词库 = 现有 words.js（400 个精编词条）+ 开源词库合并新增（约 2.4 万） */
function buildSeedWords() {
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
    users: {}, // userId -> { id, username, passwordHash, salt, createdAt }
    sessions: {}, // token -> { userId, createdAt, expiresAt }
    wordbook: {}, // userId -> { wordId -> { status, addedAt, updatedAt, reviewCount, intervalIndex, nextReview, lastReviewed } }
    // 统一历史记录：识别 / 测验 / 生词本操作，按 userId 隔离
    history: []
  };
}

/** 持久化仅保存用户状态（meta / users / sessions / wordbook / history） */
function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const state = {
    meta: { ...db.meta, wordsCount: db.words.length },
    users: db.users,
    sessions: db.sessions,
    wordbook: db.wordbook,
    history: db.history
  };
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(tmp, DB_PATH);
}

/**
 * 词书结构迁移：旧版 wordbook = { wordId: entry } → 新版 = { userId: { wordId: entry } }
 * 旧版单用户数据归档到 local 桶，避免丢失。
 */
function migrateWordbook(rawWb) {
  const wb = rawWb || {};
  const first = wb[Object.keys(wb)[0]];
  if (first && typeof first === 'object' && 'wordId' in first) {
    return { local: wb };
  }
  return wb;
}

/** v1/v2 历史记录迁移为统一 history */
function migrate(raw) {
  const migrated = [];
  const seen = new Set();

  for (const r of raw.recognitionHistory || []) {
    if (!r || !r.id || seen.has(r.id)) continue;
    seen.add(r.id);
    migrated.push({
      id: r.id,
      userId: r.userId || 'local',
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
    migrated.push({
      id,
      userId: q.userId || 'local',
      type: 'quiz',
      createdAt: q.answeredAt,
      wordId: q.wordId,
      word: q.word || q.wordId,
      questionType: q.questionType,
      correct: !!q.correct
    });
  }

  migrated.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

  return { history: migrated, wordbook: migrateWordbook(raw.wordbook) };
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

  db = defaultDb();
  db.meta = {
    version: DB_VERSION,
    seededAt: db.meta.seededAt,
    wordsCount: db.words.length,
    migratedFrom: raw.meta && raw.meta.version
  };
  db.users = raw.users || {};
  db.sessions = raw.sessions || {};

  if (Array.isArray(raw.history)) {
    db.history = raw.history.map((h) => ({ ...h, userId: h.userId || 'local' }));
    db.wordbook = migrateWordbook(raw.wordbook);
  } else {
    const m = migrate(raw);
    db.history = m.history;
    db.wordbook = m.wordbook;
  }

  // 清理过期会话
  const now = Date.now();
  for (const token of Object.keys(db.sessions)) {
    if (new Date(db.sessions[token].expiresAt).getTime() < now) delete db.sessions[token];
  }
  db.history = db.history.slice(-HISTORY_MAX);
  save();
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

// ---------------------------------------------------------------------------
// 用户与会话
// ---------------------------------------------------------------------------
function findUserByUsername(username) {
  const key = String(username || '').trim().toLowerCase();
  return Object.values(ensureDb().users).find((u) => u.username.toLowerCase() === key) || null;
}

function getUser(userId) {
  return ensureDb().users[userId] || null;
}

function createUser(username, passwordHash, salt) {
  const dbRef = ensureDb();
  const user = {
    id: crypto.randomUUID(),
    username: String(username).trim(),
    passwordHash,
    salt,
    createdAt: new Date().toISOString()
  };
  dbRef.users[user.id] = user;
  dbRef.wordbook[user.id] = dbRef.wordbook[user.id] || {};
  save();
  return user;
}

function createSession(userId, expiresAt) {
  const dbRef = ensureDb();
  const token = crypto.randomBytes(32).toString('hex');
  dbRef.sessions[token] = { userId, createdAt: new Date().toISOString(), expiresAt };
  save();
  return token;
}

function findSession(token) {
  const s = ensureDb().sessions[token];
  if (!s) return null;
  if (new Date(s.expiresAt).getTime() < Date.now()) {
    delete ensureDb().sessions[token];
    save();
    return null;
  }
  return s;
}

function removeSession(token) {
  const dbRef = ensureDb();
  const existed = !!dbRef.sessions[token];
  delete dbRef.sessions[token];
  if (existed) save();
  return existed;
}

// ---------------------------------------------------------------------------
// 生词本（按用户隔离）
// ---------------------------------------------------------------------------
function wordbookOf(userId) {
  const dbRef = ensureDb();
  const uid = userId || 'local';
  if (!dbRef.wordbook[uid]) dbRef.wordbook[uid] = {};
  return dbRef.wordbook[uid];
}

function wordbookEntry(userId, wordId) {
  return wordbookOf(userId)[wordId] || null;
}

function upsertWordbook(userId, wordId, status, patch = {}) {
  const book = wordbookOf(userId);
  const now = new Date().toISOString();
  const existing = book[wordId];
  book[wordId] = {
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
  return book[wordId];
}

function removeWordbook(userId, wordId) {
  const book = wordbookOf(userId);
  const existed = !!book[wordId];
  delete book[wordId];
  if (existed) save();
  return existed;
}

// ---------------------------------------------------------------------------
// 历史记录
// ---------------------------------------------------------------------------
function pushHistory(entry) {
  const dbRef = ensureDb();
  dbRef.history.push({
    id: crypto.randomUUID(),
    userId: entry.userId || 'local',
    createdAt: new Date().toISOString(),
    ...entry
  });
  if (dbRef.history.length > HISTORY_MAX) {
    dbRef.history = dbRef.history.slice(-HISTORY_MAX);
  }
  return dbRef.history[dbRef.history.length - 1];
}

function removeHistory(userId, id) {
  const dbRef = ensureDb();
  const idx = dbRef.history.findIndex((h) => h.id === id && h.userId === userId);
  if (idx < 0) return false;
  dbRef.history.splice(idx, 1);
  return true;
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
  findUserByUsername,
  getUser,
  createUser,
  createSession,
  findSession,
  removeSession,
  wordbookOf,
  wordbookEntry,
  upsertWordbook,
  removeWordbook,
  pushHistory,
  removeHistory
};
