/**
 * mergedAdapter.js —— 将 words_merged.js（新结构）转换为应用运行时词库结构
 *
 * words_merged.js 结构：
 *   { word, phonetic_uk, phonetic_us,
 *     meanings: [{ pos, definition, frequency }],
 *     root, synonyms, antonyms, derivatives, examTips,
 *     collocations, phrases, examples: [{en, cn}], syllabus: [...] }
 *
 * 运行时结构（与 words.js 一致）：
 *   { id, word, phoneticUK, phoneticUS, pos, meanings: string[],
 *     level, exams: string[], examples: [{en, zh}],
 *     synonyms, antonyms, derivatives, collocations, examPoint, realExam, memoryTip }
 */

const mergedWords = require('./words_merged.js');

/** 频率星级 -> 运行时重要程度级别 */
const FREQ_TO_LEVEL = {
  '★★★': 'high_frequency',
  '★★': 'frequent',
  '★': 'key',
  认知: 'cognition'
};

/** 合并词条 -> 运行时词条 */
function toRuntime(m) {
  const meanings = (m.meanings || [])
    .map((x) => (x.definition || '').trim())
    .filter(Boolean);

  const pos =
    (m.meanings || []).map((x) => (x.pos || '').trim()).find((p) => p !== '') || '';

  const freq = (m.meanings || []).map((x) => x.frequency).find((f) => f);
  const level = FREQ_TO_LEVEL[freq] || 'key';

  // 短语（{phrase, meaning}）并入搭配，展示为 "短语 释义"
  const phraseStrings = (m.phrases || []).map((p) => {
    if (typeof p === 'string') return p;
    return p.phrase + (p.meaning ? ` ${p.meaning}` : '');
  });
  const collocations = [...new Set([...(m.collocations || []), ...phraseStrings])];

  return {
    id: m.word,
    word: m.word,
    phoneticUK: m.phonetic_uk || '',
    phoneticUS: m.phonetic_us || '',
    pos,
    meanings,
    level,
    exams: Array.isArray(m.syllabus) ? m.syllabus : [],
    examples: (m.examples || []).map((e) => ({ en: e.en || '', zh: e.cn || '' })),
    synonyms: m.synonyms || [],
    antonyms: m.antonyms || [],
    derivatives: m.derivatives || [],
    collocations,
    examPoint: m.examTips || '',
    realExam: [],
    memoryTip: ''
  };
}

/** 与现有 words.js 按 word（小写）去重后，输出全部新增词条 */
function buildMergedRuntimeWords(existingWords) {
  const seen = new Set(existingWords.map((w) => String(w.word).toLowerCase()));
  const added = [];
  for (const m of mergedWords) {
    const key = String(m.word).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    added.push(toRuntime(m));
  }
  return added;
}

module.exports = { toRuntime, buildMergedRuntimeWords, mergedCount: mergedWords.length };
