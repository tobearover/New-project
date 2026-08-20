/**
 * mergeVocabulary.js —— 将开源词库 english-vocabulary 合并进 SmartVocab 词库
 *
 * 数据源（4 个 JSON）：
 *   tb_vocabulary.json   词汇主表（spelling / UKphonetic / USphonetic / paraphrase / frequency）
 *   tb_voc_examples.json 例句表（wordid -> en / cn / heat）
 *   tb_book.json         单词书（考纲）表（bookid -> bookname）
 *   tb_voc_book.json     词书关联表（wordid -> bookid）
 *
 * 输出：server/src/seed/words_merged.js（仅新增词条，不覆盖现有 words.js）
 * 运行：node scripts/mergeVocabulary.js  或  npm run merge:vocab
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 0. 路径解析：脚本位于 server/scripts/ 下，仓库根目录在其上两级
// ---------------------------------------------------------------------------
const REPO_ROOT = path.resolve(__dirname, '..', '..');

// 数据源目录：显式指定 SOURCE_DIR 时以它为准（必须完整）；
// 未指定时自动探测 server/src/seed/source 与项目根下的 english-vocabulary-master
const DEFAULT_SOURCE_CANDIDATES = [
  path.join(REPO_ROOT, 'server', 'src', 'seed', 'source'),
  path.join(REPO_ROOT, 'english-vocabulary-master')
];

const REQUIRED_FILES = [
  'tb_vocabulary.json',
  'tb_voc_examples.json',
  'tb_book.json',
  'tb_voc_book.json'
];

const OUTPUT_FILE = path.join(REPO_ROOT, 'server', 'src', 'seed', 'words_merged.js');
const EXISTING_SEED_FILE = path.join(REPO_ROOT, 'server', 'src', 'seed', 'words.js');

// ---------------------------------------------------------------------------
// 1. 工具函数
// ---------------------------------------------------------------------------

/** 读取并解析 JSON，失败时给出明确错误并退出 */
function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[错误] 无法读取/解析 JSON 文件：${filePath}`);
    console.error(`       原因：${err.message}`);
    process.exit(1);
  }
}

/** 在候选目录中寻找包含全部 4 个 JSON 的目录；找不到则报错退出 */
function resolveSourceDir() {
  const candidates = process.env.SOURCE_DIR
    ? [path.resolve(process.env.SOURCE_DIR)]
    : DEFAULT_SOURCE_CANDIDATES;

  for (const dir of candidates) {
    const missing = REQUIRED_FILES.filter((f) => !fs.existsSync(path.join(dir, f)));
    if (missing.length === 0) return dir;
  }

  console.error('[错误] 未找到完整的数据源目录。以下目录均缺少必需的 JSON 文件：');
  for (const dir of candidates) {
    const present = REQUIRED_FILES.filter((f) => fs.existsSync(path.join(dir, f)));
    const missing = REQUIRED_FILES.filter((f) => !present.includes(f));
    console.error(`  - ${dir}`);
    console.error(`      存在：${present.length ? present.join(', ') : '（无）'}`);
    console.error(`      缺少：${missing.length ? missing.join(', ') : '（无）'}`);
  }
  console.error('请将 tb_vocabulary.json / tb_voc_examples.json / tb_book.json / tb_voc_book.json');
  console.error('放入上述任一目录，或通过环境变量 SOURCE_DIR 指定数据源目录后重试。');
  process.exit(1);
}

/** 词性标记列表（用于从释义段中提取词性） */
const POS_TOKENS = [
  'vt.', 'vi.', 'v.', 'n.', 'adj.', 'adv.', 'prep.', 'conj.',
  'pron.', 'art.', 'num.', 'int.', 'aux.', 'abbr.', 'a.', 'ad.', 'pl.'
];
// 注意：词性列表需整体放进一个非捕获组，再统一追加 (\s*(?:&\s*)?)，
// 否则后缀只作用于列表最后一项，导致 "vt.& vi." 这类复合词性截取不完整
const POS_REGEX = new RegExp(
  `^((?:(?:${POS_TOKENS.join('|')})\\s*(?:&\\s*)?)+)\\s*(.*)$`,
  'i'
);

/**
 * 频率数值 -> 等级标签（所有义项共用同一等级）
 * >0.5 → ★★★；0.3~0.5 → ★★；0.1~0.3 → ★；<0.1 → 认知
 */
function frequencyLabel(frequency) {
  const n = Number(frequency);
  if (!Number.isFinite(n)) return ''; // 无频率数据
  if (n > 0.5) return '★★★';
  if (n > 0.3) return '★★';
  if (n >= 0.1) return '★';
  return '认知';
}

/**
 * 解析 paraphrase 为多个义项：
 * 先按中文逗号/英文逗号（并兼容分号）拆分，再尝试提取词性，其余部分作为释义。
 */
function parseMeanings(paraphrase, freqLabel) {
  if (!paraphrase || typeof paraphrase !== 'string') return [];

  return paraphrase
    .split(/[，,；;]/)
    .map((seg) => seg.trim())
    .filter(Boolean)
    .map((seg) => {
      const match = seg.match(POS_REGEX);
      if (match && match[2].trim()) {
        return {
          pos: match[1].trim().replace(/\s+/g, ' '),
          definition: match[2].trim(),
          frequency: freqLabel
        };
      }
      // 没有词性标记（或整段都是词性，无释义），pos 置为空字符串
      return { pos: '', definition: seg, frequency: freqLabel };
    });
}

/**
 * 强制性考纲筛选规则：仅保留关联到以下 11 个考纲词书的单词，其余全部丢弃。
 * 关键词支持中英文模糊包含匹配；英文不区分大小写并忽略 -、_、空格（如 CET-4 == CET4）。
 */
const SYLLABUS_RULES = [
  { id: 'cet4', keywords: ['大学英语四级', '四级', 'CET4', 'CET-4', 'CET 4'] },
  { id: 'cet6', keywords: ['大学英语六级', '六级', 'CET6', 'CET-6', 'CET 6'] },
  { id: 'kaoyan', keywords: ['研究生英语', '考研英语', '考研'] },
  { id: 'ielts', keywords: ['雅思', 'IELTS'] },
  { id: 'toefl', keywords: ['托福', 'TOEFL'] },
  { id: 'gre', keywords: ['GRE'] },
  { id: 'gmat', keywords: ['GMAT'] },
  { id: 'tem4', keywords: ['英语专业四级', '专业四级', '专四', 'TEM4', 'TEM-4'] },
  { id: 'tem8', keywords: ['英语专业八级', '专业八级', '专八', 'TEM8', 'TEM-8'] },
  { id: 'bec', keywords: ['商务英语', 'BEC'] },
  { id: 'gaokao', keywords: ['高中英语', '高考'] }
];

/** 词书名称 -> 命中的考纲标识列表（可能命中多个，如词书同时涵盖四级与考研） */
function matchSyllabus(bookname) {
  const upper = bookname.toUpperCase().replace(/[-_\s]/g, '');
  const hits = [];
  for (const rule of SYLLABUS_RULES) {
    const matched = rule.keywords.some((kw) => {
      if (/[\u4e00-\u9fa5]/.test(kw)) return bookname.includes(kw);
      return upper.includes(kw.toUpperCase().replace(/[-_\s]/g, ''));
    });
    if (!matched) continue;
    // 防误判：普通“四级/六级”不应命中“英语专业四级/专业八级”等专业考纲词书
    if (rule.id === 'cet4' && /专业四级|专四|TEM[- ]?4/i.test(bookname)) continue;
    if (rule.id === 'cet6' && /专业六级|专六|TEM[- ]?6/i.test(bookname)) continue;
    hits.push(rule.id);
  }
  return hits;
}

/** 按规格生成目标词条对象（保留空字段，便于后续 AI 补全） */
function buildEntry(record, examples, syllabi) {
  return {
    word: record.spelling,
    phonetic_uk: record.UKphonetic || '',
    phonetic_us: record.USphonetic || '',
    meanings: parseMeanings(record.paraphrase, frequencyLabel(record.frequency)),
    root: '',
    synonyms: [],
    antonyms: [],
    derivatives: [],
    examTips: '',
    collocations: [],
    phrases: [],
    examples,
    syllabus: syllabi
  };
}

// ---------------------------------------------------------------------------
// 2. 加载数据源与既有词库
// ---------------------------------------------------------------------------
console.log('正在加载数据源…');
const SOURCE_DIR = resolveSourceDir();
const vocabulary = readJson(path.join(SOURCE_DIR, 'tb_vocabulary.json'));
const examplesRaw = readJson(path.join(SOURCE_DIR, 'tb_voc_examples.json'));
const books = readJson(path.join(SOURCE_DIR, 'tb_book.json'));
const vocBook = readJson(path.join(SOURCE_DIR, 'tb_voc_book.json'));

// 读取现有词库（仅用于去重，不修改原文件）
let existingWords = [];
try {
  existingWords = require(EXISTING_SEED_FILE).words || [];
} catch (err) {
  console.error(`[错误] 无法读取现有词库 ${EXISTING_SEED_FILE}：${err.message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 3. 建立索引（Map，以 wordid 为键）
// ---------------------------------------------------------------------------
console.log('正在建立例句索引…');
const exampleIndex = new Map(); // wordid -> 例句数组
for (const ex of examplesRaw) {
  if (!exampleIndex.has(ex.wordid)) exampleIndex.set(ex.wordid, []);
  exampleIndex.get(ex.wordid).push({ en: ex.en, cn: ex.cn, heat: ex.heat || 0 });
}

console.log('正在建立考纲索引并执行强制筛选…');
// bookid -> 考纲标识列表（由 bookname 模糊匹配得到；匹配不到的词书视为“非考纲词书”）
const syllabusByBook = new Map();
for (const b of books) syllabusByBook.set(b.bookid, matchSyllabus(b.bookname));

// wordid -> 去重后的考纲标识列表（跨词书取并集）
const syllabusByWord = new Map();
for (const link of vocBook) {
  const ids = syllabusByBook.get(link.bookid);
  if (!ids || ids.length === 0) continue;
  const list = syllabusByWord.get(link.wordid) || [];
  for (const id of ids) {
    if (!list.includes(id)) list.push(id);
  }
  syllabusByWord.set(link.wordid, list);
}

// ---------------------------------------------------------------------------
// 4. 去重与合并：现有词库按 word 建立 Set（统一小写，避免大小写重复）
// ---------------------------------------------------------------------------
const existingSet = new Set(existingWords.map((w) => String(w.word).toLowerCase()));
const merged = [];
let added = 0;
let skipped = 0;
let filteredOut = 0;
let withExamples = 0;
let withSyllabus = 0;

console.log('正在合并词条…');
for (const record of vocabulary) {
  // 强制性考纲筛选：先于任何字段映射；未关联任何允许考纲词书的单词直接丢弃
  const syllabi = syllabusByWord.get(record.wordid) || [];
  if (syllabi.length === 0) {
    filteredOut += 1;
    continue;
  }

  const key = String(record.spelling).toLowerCase();
  if (existingSet.has(key)) {
    skipped += 1;
    continue;
  }
  existingSet.add(key); // 源文件内部去重（同一拼写只保留第一条）

  // 例句：按 heat 降序，最多取前 3 条
  const examples = (exampleIndex.get(record.wordid) || [])
    .slice()
    .sort((a, b) => b.heat - a.heat)
    .slice(0, 3)
    .map(({ en, cn }) => ({ en, cn }));

  merged.push(buildEntry(record, examples, syllabi));

  added += 1;
  if (examples.length > 0) withExamples += 1;
  if (syllabi.length > 0) withSyllabus += 1;
}

// ---------------------------------------------------------------------------
// 5. 写出 words_merged.js（每个词条一行，便于审查）
// ---------------------------------------------------------------------------
console.log('正在写入输出文件…');
const lines = merged.map((entry) => '  ' + JSON.stringify(entry));
const content =
  '// 本文件由 scripts/mergeVocabulary.js 自动生成，请勿手工修改。\n' +
  '// 数据源：https://github.com/zhenghaoyang24/english-vocabulary\n' +
  '// 重新生成：npm run merge:vocab\n' +
  'module.exports = [\n' +
  lines.join(',\n') +
  '\n];\n';

try {
  fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
} catch (err) {
  console.error(`[错误] 写入输出文件失败：${OUTPUT_FILE}`);
  console.error(`       原因：${err.message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 6. 统计信息
// ---------------------------------------------------------------------------
console.log('\n========== 合并完成 ==========');
console.log(`原词库词条数          ：${existingWords.length}`);
console.log(`开源词库总词条数      ：${vocabulary.length}`);
console.log(`被考纲筛选丢弃词条数  ：${filteredOut}`);
console.log(`筛选后保留词条数      ：${vocabulary.length - filteredOut}`);
console.log(`成功新增词条数        ：${added}`);
console.log(`重复跳过词条数        ：${skipped}`);
console.log(`包含例句的单词数      ：${withExamples}`);
console.log(`包含考纲标签的单词数  ：${withSyllabus}`);
console.log('--------------------------------');
console.log(`输出文件              ：${OUTPUT_FILE}`);
console.log(`输出文件大小          ：${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
