/**
 * 识别结果快照工具
 *
 * 背景：历史识别详情原先依赖“原文 + 当前词库重新提取”，词库/考纲日后变化会导致
 * 老记录结果漂移。因此识别入库时固化一份展示级快照（词 id + level + 释义 + 原文摘要），
 * 详情页优先读快照；老记录（无快照）仍回退到重新提取，保证不丢数据。
 */

const { extractAndMatch } = require('./extractor');

const RAW_TEXT_MAX = 2000; // 原文存储上限，避免 db.json 无限膨胀

/** 展示级单词：只保留详情渲染需要的字段，避免整条词库记录入库 */
function snapshotWord(w) {
  return {
    id: w.id,
    word: w.word,
    pos: w.pos,
    meanings: w.meanings,
    level: w.level,
    count: w.count || 1
  };
}

/** 从 extractAndMatch 结果生成可持久化快照（不含 status，状态实时合并） */
function buildRecognitionSnapshot(matched) {
  return {
    stats: matched.stats,
    orderedGroups: (matched.orderedGroups || []).map((g) => ({
      level: g.level,
      label: g.label,
      words: (g.words || []).map(snapshotWord)
    })),
    phrases: (matched.phrases || []).map((p) => ({
      id: p.id,
      phrase: p.phrase,
      meaning: p.meaning
    }))
  };
}

/** 合并当前用户生词本状态到快照单词（词义/层级保持快照，标记状态用最新） */
function hydrateSnapshot(snapshot, userWordbook) {
  const book = userWordbook || {};
  const hydratedGroups = (snapshot.orderedGroups || []).map((g) => ({
    ...g,
    words: (g.words || []).map((w) => ({
      ...w,
      status: book[w.id] ? book[w.id].status : null
    }))
  }));

  const groups = {};
  for (const g of hydratedGroups) groups[g.level] = g.words;

  return {
    stats: snapshot.stats,
    groups,
    orderedGroups: hydratedGroups,
    phrases: snapshot.phrases || []
  };
}

/**
 * 渲染识别历史详情：优先返回入库时快照；无快照（升级前老数据）回退为
 * “原文 + 当前词库”重新提取。
 */
function renderRecognitionDetail(record, db, userId) {
  const userWordbook = (db.wordbook || {})[userId] || {};

  if (record.snapshot && record.snapshot.orderedGroups) {
    return {
      ...hydrateSnapshot(record.snapshot, userWordbook),
      fromSnapshot: true
    };
  }

  const matched = extractAndMatch({
    text: record.rawText || '',
    words: db.words,
    phrases: db.phrases,
    syllabusId: record.syllabus || null,
    wordbook: userWordbook
  });
  return {
    stats: matched.stats,
    groups: matched.groups,
    orderedGroups: matched.orderedGroups,
    phrases: matched.phrases,
    fromSnapshot: false
  };
}

module.exports = {
  RAW_TEXT_MAX,
  buildRecognitionSnapshot,
  renderRecognitionDetail
};
