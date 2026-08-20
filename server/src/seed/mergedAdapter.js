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
const enrichWords = require('./words_merged_enrich.js');

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
    realExam: (m.realExam || []).map((r) => ({
      source: r.source || '',
      sentence: r.sentence || '',
      note: ''
    })),
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

/**
 * 数据回流：将 words_merged_enrich.js 中与精编词条重复而跳过的开源数据
 * （例句/同反义词/派生词/搭配/真题例句）并回精编词条，提升展示丰富度。
 */
function enrichCuratedWords(curated) {
  const enrichMap = new Map(enrichWords.map((m) => [String(m.word).toLowerCase(), m]));
  return curated.map((w) => {
    const m = enrichMap.get(String(w.word).toLowerCase());
    if (!m) return w;

    const out = {
      ...w,
      examples: [...(w.examples || [])],
      synonyms: [...(w.synonyms || [])],
      antonyms: [...(w.antonyms || [])],
      derivatives: [...(w.derivatives || [])],
      collocations: [...(w.collocations || [])]
    };

    const addUniq = (arr, items, cap, keyFn) => {
      const set = new Set(arr.map((x) => (keyFn ? keyFn(x) : x)));
      for (const x of items || []) {
        if (arr.length >= cap) break;
        const k = keyFn ? keyFn(x) : x;
        if (k && !set.has(k)) {
          set.add(k);
          arr.push(x);
        }
      }
    };

    addUniq(out.examples, m.examples, 8, (e) => (e.en || '').toLowerCase());
    addUniq(out.synonyms, m.synonyms, 10);
    addUniq(out.antonyms, m.antonyms, 6);
    addUniq(out.derivatives, m.derivatives, 8);
    const phraseStrings = (m.phrases || []).map((p) =>
      typeof p === 'string' ? p : p.phrase + (p.meaning ? ` ${p.meaning}` : '')
    );
    addUniq(out.collocations, [...(m.collocations || []), ...phraseStrings], 12);

    // 真题例句：精编词条缺失时才补入
    if ((!w.realExam || w.realExam.length === 0) && m.realExam && m.realExam.length) {
      out.realExam = m.realExam.slice(0, 3).map((r) => ({
        source: r.source || '',
        sentence: r.sentence || '',
        note: ''
      }));
    }
    return out;
  });
}

module.exports = {
  toRuntime,
  buildMergedRuntimeWords,
  enrichCuratedWords,
  mergedCount: mergedWords.length,
  enrichCount: enrichWords.length
};
