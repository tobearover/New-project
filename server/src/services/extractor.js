const { LEVEL_LABELS } = require('../seed/words');

// 常见功能词停用词（不参与考纲匹配）
const STOPWORDS = new Set([
  'the','a','an','and','of','to','in','is','are','was','were','be','been','being',
  'it','this','that','these','those','i','you','he','she','we','they','them','his','her',
  'its','our','your','their','my','me','us','for','on','at','by','with','from','as','or',
  'but','not','no','so','if','then','than','too','very','can','could','will','would','shall',
  'should','may','might','must','do','does','did','done','has','have','had','there','here',
  'when','where','why','how','what','which','who','whom','whose','about','into','over','after',
  'before','during','without','between','through','under','against','out','up','down','off',
  'again','more','most','some','any','all','each','every','both','few','such','only','own',
  'same','just','because','while','also','well','even','still','much','many','one','two','now',
  'never','always','often','sometimes','since','until','above','below','within','among','near',
  'except','other','another','others','these','those','them','us','we','you','she','he','itself',
  'himself','herself','themselves','ourselves','yourselves','its','im','youre','hes','shes',
  'theyre','weve','ive','youve','dont','cant','wont','isnt','arent','wasnt','werent','doesnt',
  'didnt','hasnt','havent','would','could','should','need','needs','needed','want','wants','get',
  'gets','got','make','makes','made','take','takes','took','see','sees','saw','know','knows',
  'knew','say','says','said','think','thinks','thought','go','goes','went','come','comes','came',
  'use','uses','used','like','likes','first','second','third','way','ways','part','parts','may'
]);

const LEVEL_ORDER = ['high_frequency', 'frequent', 'key', 'cognition'];

function normalizeToken(raw) {
  return raw
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/^[''-]+|[''-]+$/g, '')
    .replace(/[^a-z'-]/g, '');
}

function tokenize(text) {
  const raw = text.match(/[A-Za-z][A-Za-z'’‘-]{1,}/g) || [];
  const counts = new Map();
  for (const token of raw) {
    const t = normalizeToken(token);
    if (t.length < 2 || !/^[a-z]+$/.test(t) || STOPWORDS.has(t)) continue;
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  return [...counts.entries()].map(([token, count]) => ({ token, count }));
}

function phraseMatches(text, phrases) {
  const lower = ` ${text.toLowerCase().replace(/[’‘]/g, "'")} `;
  return phrases.filter((p) => {
    const key = ` ${p.phrase.toLowerCase()} `;
    return lower.includes(key);
  });
}

function matchWords(tokens, wordMap, wordbook) {
  const groups = {};
  LEVEL_ORDER.forEach((lvl) => (groups[lvl] = []));

  const seen = new Set();
  for (const { token, count } of tokens) {
    const record = wordMap.get(token);
    if (!record || seen.has(record.id)) continue;
    seen.add(record.id);
    const wb = wordbook[record.id];
    groups[record.level] = groups[record.level] || [];
    groups[record.level].push({
      id: record.id,
      word: record.word,
      pos: record.pos,
      meanings: record.meanings,
      phoneticUK: record.phoneticUK,
      phoneticUS: record.phoneticUS,
      level: record.level,
      exams: record.exams,
      count,
      status: wb ? wb.status : null
    });
  }

  return {
    groups,
    order: LEVEL_ORDER.map((lvl) => ({ level: lvl, label: LEVEL_LABELS[lvl], words: groups[lvl] }))
  };
}

function buildWordMap(words, syllabusId) {
  const map = new Map();
  for (const w of words) {
    if (syllabusId && !w.exams.includes(syllabusId)) continue;
    map.set(w.word.toLowerCase(), w);
  }
  return map;
}

function extractAndMatch({ text, words, phrases, syllabusId, wordbook }) {
  const tokens = tokenize(text);
  const wordMap = buildWordMap(words, syllabusId);
  const matched = matchWords(tokens, wordMap, wordbook || {});
  const matchedIds = new Set(
    Object.values(matched.groups).flat().map((w) => w.id)
  );
  const unknownSet = new Set();
  for (const { token } of tokens) {
    if (!wordMap.has(token) && !matchedIds.has(token)) unknownSet.add(token);
  }

  const unknown = [...unknownSet]
    .map((token) => {
      const t = tokens.find((x) => x.token === token);
      return { token, count: t ? t.count : 1 };
    })
    .sort((a, b) => b.count - a.count);

  const phraseHits = phraseMatches(text, phrases || []);
  const totalMatched = Object.values(matched.groups).reduce((sum, arr) => sum + arr.length, 0);

  return {
    tokens,
    phrases: phraseHits,
    groups: matched.groups,
    orderedGroups: matched.order,
    unknowns: unknown,
    stats: {
      totalTokens: tokens.length,
      matchedWords: totalMatched,
      matchedPhrases: phraseHits.length,
      unknownWords: unknown.length
    }
  };
}

module.exports = { extractAndMatch, tokenize, STOPWORDS, LEVEL_ORDER };
