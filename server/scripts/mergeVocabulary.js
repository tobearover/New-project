/**
 * mergeVocabulary.js —— 多数据源词库合并脚本
 *
 * 三个数据源，统一按 SmartVocab 目标结构输出，并执行强制性考纲筛选：
 *
 * 1. english-vocabulary（tb_vocabulary.json 等 4 个 JSON）
 *    - 通过 tb_voc_book + tb_book 反查词书名称，用 11 个考纲关键词模糊匹配，
 *      未关联任何允许考纲词书的单词整词丢弃。
 * 2. dict-master（有道背单词词书 dump，book/*.zip，每个 zip 一个 NDJSON 词书）
 *    - 仅处理映射到允许考纲的词书（CET4/CET6/KaoYan/IELTS/TOEFL/GRE/GMAT/BEC/
 *      Level4/Level8/GaoZhong），SAT/初中/小学等词书整本跳过。
 * 3. cet6-vocabulary（六级真题高频词 CSV + 简洁版 MD 词义表）
 *    - 全量标记为 cet6 考纲，过滤掉含 filter_reason 的低价值词条。
 *
 * 运行：node scripts/mergeVocabulary.js  或  npm run merge:vocab
 * 输出：server/src/seed/words_merged.js（不覆盖 words.js）
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ---------------------------------------------------------------------------
// 0. 路径解析
// ---------------------------------------------------------------------------
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const DEFAULT_SOURCE_CANDIDATES = [
  path.join(REPO_ROOT, 'server', 'src', 'seed', 'source'),
  path.join(REPO_ROOT, 'english-vocabulary-master')
];
const DICT_DIR = path.join(REPO_ROOT, 'dict-master', 'book');
const CET6_DIR = path.join(REPO_ROOT, 'cet6-vocabulary-main');

const REQUIRED_FILES = [
  'tb_vocabulary.json',
  'tb_voc_examples.json',
  'tb_book.json',
  'tb_voc_book.json'
];

const OUTPUT_FILE = path.join(REPO_ROOT, 'server', 'src', 'seed', 'words_merged.js');
const EXISTING_SEED_FILE = path.join(REPO_ROOT, 'server', 'src', 'seed', 'words.js');

// ---------------------------------------------------------------------------
// 1. 基础工具
// ---------------------------------------------------------------------------

/** 读取并解析 JSON，失败时给出明确错误并退出 */
function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`[错误] 无法读取/解析 JSON 文件：${filePath}`);
    console.error(`       原因：${err.message}`);
    process.exit(1);
  }
}

/** 解析 NDJSON（每行一个对象）或单条 JSON 数组 */
function parseJsonRecords(content, label) {
  const text = content.replace(/^\uFEFF/, '').trim();
  if (text.startsWith('[')) {
    try {
      return { records: JSON.parse(text), badLines: 0 };
    } catch (err) {
      console.error(`[警告] ${label} 以数组开头但整体解析失败：${err.message}`);
    }
  }
  const records = [];
  let bad = 0;
  for (const line of text.split(/\r?\n/)) {
    const l = line.trim();
    if (!l) continue;
    try {
      records.push(JSON.parse(l));
    } catch {
      bad += 1;
    }
  }
  if (bad > 0) console.error(`[警告] ${label} 有 ${bad} 行无法解析，已跳过`);
  return { records, badLines: bad };
}

/** 纯 Node 实现的最小 ZIP 读取器：定位 EOCD，解析中央目录，取第一个 .json 条目并解压 */
function readZipJson(zipPath) {
  const buf = fs.readFileSync(zipPath);

  // 1) 从文件尾部寻找 End of Central Directory（EOCD）
  let eocd = -1;
  const searchStart = Math.max(0, buf.length - 65557);
  for (let i = buf.length - 22; i >= searchStart; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('ZIP 结构无效（未找到 EOCD）');

  // 2) 遍历中央目录，找到第一个 .json 条目
  const entryCount = buf.readUInt16LE(eocd + 10);
  let offset = buf.readUInt32LE(eocd + 16);
  let target = null;
  for (let i = 0; i < entryCount; i++) {
    if (buf.readUInt32LE(offset) !== 0x02014b50) break;
    const method = buf.readUInt16LE(offset + 10);
    const compSize = buf.readUInt32LE(offset + 20);
    const nameLen = buf.readUInt16LE(offset + 28);
    const extraLen = buf.readUInt16LE(offset + 30);
    const commentLen = buf.readUInt16LE(offset + 32);
    const localHeaderOffset = buf.readUInt32LE(offset + 42);
    const name = buf.toString('utf8', offset + 46, offset + 46 + nameLen);
    if (!target && name.toLowerCase().endsWith('.json')) {
      target = { method, compSize, localHeaderOffset };
    }
    offset += 46 + nameLen + extraLen + commentLen;
  }
  if (!target) throw new Error('ZIP 中未找到 .json 文件');

  // 3) 读取本地文件头，计算数据起始位置
  const nameLen = buf.readUInt16LE(target.localHeaderOffset + 26);
  const extraLen = buf.readUInt16LE(target.localHeaderOffset + 28);
  const dataStart = target.localHeaderOffset + 30 + nameLen + extraLen;
  const raw = buf.subarray(dataStart, dataStart + target.compSize);

  if (target.method === 8) return zlib.inflateRawSync(raw).toString('utf8'); // deflate
  if (target.method === 0) return raw.toString('utf8'); // stored
  throw new Error(`不支持的 ZIP 压缩方式：${target.method}`);
}

/** 简易 RFC4180 CSV 解析器（处理引号包裹的逗号/换行），返回对象数组 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }

  const header = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.some((cell) => cell.trim() !== ''))
    .map((r) => {
      const obj = {};
      header.forEach((h, idx) => (obj[h] = (r[idx] || '').trim()));
      return obj;
    });
}

/** 解析简洁版 MD 词表（| 序号 | **单词** | 中文意思 |），返回 word(小写) -> 中文释义 */
function parseSimpleMdMeanings(mdPath) {
  const map = new Map();
  if (!fs.existsSync(mdPath)) return map;
  const text = fs.readFileSync(mdPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\|\s*\d+\s*\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|]+)\s*\|/);
    if (m) map.set(m[1].trim().toLowerCase(), m[2].trim());
  }
  return map;
}

/** 词性标记列表（用于从释义段中提取词性） */
const POS_TOKENS = [
  'vt.', 'vi.', 'v.', 'n.', 'adj.', 'adv.', 'prep.', 'conj.',
  'pron.', 'art.', 'num.', 'int.', 'aux.', 'abbr.', 'a.', 'ad.', 'pl.'
];
// 词性列表整体放进非捕获组，再统一追加 (\s*(?:&\s*)?)，
// 避免后缀只作用于最后一项导致 "vt.& vi." 截取不完整
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
  if (!Number.isFinite(n)) return '';
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
      return { pos: '', definition: seg, frequency: freqLabel };
    });
}

// ---------------------------------------------------------------------------
// 2. 强制性考纲筛选规则（11 个允许考纲，中英文关键词模糊匹配）
// ---------------------------------------------------------------------------
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

/** 词书名称 -> 命中的考纲标识列表（可能命中多个） */
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

/** 有道词书 bookId -> 考纲标识；不在 11 个允许考纲内的词书返回 null（整本跳过） */
function dictBookToSyllabus(bookId) {
  const up = String(bookId).toUpperCase();
  if (up.startsWith('CET4')) return 'cet4';
  if (up.startsWith('CET6')) return 'cet6';
  if (up.startsWith('KAOYAN')) return 'kaoyan';
  if (up.startsWith('IELTS')) return 'ielts';
  if (up.startsWith('TOEFL')) return 'toefl';
  if (up.startsWith('GRE')) return 'gre';
  if (up.startsWith('GMAT')) return 'gmat';
  if (up.startsWith('BEC')) return 'bec';
  if (up.startsWith('LEVEL4')) return 'tem4';
  if (up.startsWith('LEVEL8')) return 'tem8';
  if (up.includes('GAOZHONG')) return 'gaokao'; // 有道/人教版/北师大版高中英语
  return null; // SAT、初中、小学、外研社初中等非允许考纲
}

// ---------------------------------------------------------------------------
// 3. 数据源加载器（每个 loader 返回 { name, total, filteredOut, entries }）
// ---------------------------------------------------------------------------

/** 在候选目录中寻找包含全部 4 个 JSON 的目录；找不到则报错退出 */
function resolveEnglishVocabDir() {
  const candidates = process.env.SOURCE_DIR
    ? [path.resolve(process.env.SOURCE_DIR)]
    : DEFAULT_SOURCE_CANDIDATES;

  for (const dir of candidates) {
    const missing = REQUIRED_FILES.filter((f) => !fs.existsSync(path.join(dir, f)));
    if (missing.length === 0) return dir;
  }

  console.error('[错误] 未找到完整的 english-vocabulary 数据源目录：');
  for (const dir of candidates) {
    const present = REQUIRED_FILES.filter((f) => fs.existsSync(path.join(dir, f)));
    const missing = REQUIRED_FILES.filter((f) => !present.includes(f));
    console.error(`  - ${dir}`);
    console.error(`      存在：${present.length ? present.join(', ') : '（无）'}`);
    console.error(`      缺少：${missing.length ? missing.join(', ') : '（无）'}`);
  }
  console.error('请将 4 个 tb_*.json 放入上述任一目录，或通过 SOURCE_DIR 指定后重试。');
  process.exit(1);
}

/** 生成目标结构词条（保留空字段，便于后续 AI 补全） */
function buildEntry(record, examples, syllabi) {
  return {
    word: record.word,
    phonetic_uk: record.phonetic_uk || '',
    phonetic_us: record.phonetic_us || '',
    meanings: record.meanings || [],
    root: record.root || '',
    synonyms: record.synonyms || [],
    antonyms: record.antonyms || [],
    derivatives: record.derivatives || [],
    examTips: record.examTips || '',
    collocations: record.collocations || [],
    phrases: record.phrases || [],
    examples,
    syllabus: syllabi
  };
}

/** 数据源一：english-vocabulary */
function loadEnglishVocabulary(sourceDir) {
  const vocabulary = readJson(path.join(sourceDir, 'tb_vocabulary.json'));
  const examplesRaw = readJson(path.join(sourceDir, 'tb_voc_examples.json'));
  const books = readJson(path.join(sourceDir, 'tb_book.json'));
  const vocBook = readJson(path.join(sourceDir, 'tb_voc_book.json'));

  // 例句索引：wordid -> [{en, cn, heat}]
  const exampleIndex = new Map();
  for (const ex of examplesRaw) {
    if (!exampleIndex.has(ex.wordid)) exampleIndex.set(ex.wordid, []);
    exampleIndex.get(ex.wordid).push({ en: ex.en, cn: ex.cn, heat: ex.heat || 0 });
  }

  // 考纲索引：bookid -> 考纲标识列表；wordid -> 考纲并集
  const syllabusByBook = new Map();
  for (const b of books) syllabusByBook.set(b.bookid, matchSyllabus(b.bookname));
  const syllabusByWord = new Map();
  for (const link of vocBook) {
    const ids = syllabusByBook.get(link.bookid);
    if (!ids || ids.length === 0) continue;
    const list = syllabusByWord.get(link.wordid) || [];
    for (const id of ids) if (!list.includes(id)) list.push(id);
    syllabusByWord.set(link.wordid, list);
  }

  const entries = [];
  let filteredOut = 0;
  for (const record of vocabulary) {
    // 强制性考纲筛选：先于任何字段映射
    const syllabi = syllabusByWord.get(record.wordid) || [];
    if (syllabi.length === 0) {
      filteredOut += 1;
      continue;
    }
    const examples = (exampleIndex.get(record.wordid) || [])
      .slice()
      .sort((a, b) => b.heat - a.heat)
      .slice(0, 3)
      .map(({ en, cn }) => ({ en, cn }));
    entries.push(
      buildEntry(
        {
          word: record.spelling,
          phonetic_uk: record.UKphonetic || '',
          phonetic_us: record.USphonetic || '',
          meanings: parseMeanings(record.paraphrase, frequencyLabel(record.frequency))
        },
        examples,
        syllabi
      )
    );
  }
  return { name: 'english-vocabulary', total: vocabulary.length, filteredOut, entries };
}

/** 数据源二：dict-master（有道词书 dump） */
function loadDictMaster(dictDir) {
  if (!fs.existsSync(dictDir)) {
    console.warn(`[警告] 未找到 dict-master 目录：${dictDir}，已跳过该数据源`);
    return { name: 'dict-master', total: 0, filteredOut: 0, entries: [] };
  }
  const zips = fs
    .readdirSync(dictDir)
    .filter((f) => f.toLowerCase().endsWith('.zip'))
    .sort();

  const entries = [];
  let bookCount = 0;
  let skippedBooks = 0;
  let totalRecords = 0;
  // word(小写) -> { data, syllabi:Set }，跨词书累积考纲标签，保证
  // 同一单词出现在 CET4 + KaoYan 等多本词书时 syllabus 为并集
  const wordData = new Map();

  for (const zipName of zips) {
    const zipPath = path.join(dictDir, zipName);
    const bookIdGuess = zipName.replace(/^\d+_/, '').replace(/\.zip$/i, '');
    const syllabus = dictBookToSyllabus(bookIdGuess);
    if (!syllabus) {
      skippedBooks += 1;
      continue; // 非允许考纲词书，整本跳过
    }

    let content;
    try {
      content = readZipJson(zipPath);
    } catch (err) {
      console.error(`[警告] 无法读取词书 ${zipName}：${err.message}`);
      skippedBooks += 1;
      continue;
    }
    const { records } = parseJsonRecords(content, zipName);
    bookCount += 1;
    totalRecords += records.length;

    for (const record of records) {
      const w = record.content && record.content.word;
      const inner = w && w.content;
      if (!inner) continue;
      const head = record.headWord || w.wordHead || '';
      const key = String(head).toLowerCase();
      if (!key) continue;

      const trans = inner.trans || [];
      const meanings = trans
        .filter((t) => t.tranCn)
        .map((t) => ({ pos: t.pos || '', definition: t.tranCn.trim(), frequency: '' }));

      const examples = ((inner.sentence && inner.sentence.sentences) || [])
        .slice(0, 3)
        .map((s) => ({ en: s.sContent || '', cn: s.sCn || '' }));

      if (!wordData.has(key)) {
        const synonyms = [];
        for (const group of (inner.syno && inner.syno.synos) || []) {
          for (const h of group.hwds || []) synonyms.push(h.w);
        }

        const antonyms = ((inner.antos && inner.antos.anto) || []).map((a) => a.hwd);

        const derivatives = [];
        for (const group of (inner.relWord && inner.relWord.rels) || []) {
          for (const x of group.words || []) {
            derivatives.push(`${x.hwd}${x.tran ? ' ' + x.tran.trim() : ''}`);
          }
        }

        const phrases = ((inner.phrase && inner.phrase.phrases) || []).map((p) => ({
          phrase: p.pContent || '',
          meaning: p.pCn || ''
        }));

        wordData.set(key, {
          data: {
            word: head,
            phonetic_uk: inner.ukphone || '',
            phonetic_us: inner.usphone || '',
            meanings,
            synonyms,
            antonyms,
            derivatives,
            phrases
          },
          examples,
          syllabi: new Set()
        });
      }
      wordData.get(key).syllabi.add(syllabus);
    }
  }

  for (const { data, examples, syllabi } of wordData.values()) {
    entries.push(buildEntry(data, examples, [...syllabi]));
  }

  return {
    name: 'dict-master',
    total: totalRecords,
    filteredOut: 0,
    extra: { bookCount, skippedBooks },
    entries
  };
}

/** 数据源三：cet6-vocabulary（六级真题高频词 CSV + 简洁版 MD 词义） */
function loadCet6Vocabulary(cet6Dir) {
  const csvPath = path.join(cet6Dir, 'cet6_high_frequency_words.csv');
  if (!fs.existsSync(csvPath)) {
    console.warn(`[警告] 未找到 cet6-vocabulary 数据源：${csvPath}，已跳过该数据源`);
    return { name: 'cet6-vocabulary', total: 0, filteredOut: 0, entries: [] };
  }

  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8')).filter((r) => !r.filter_reason);

  // 简洁版词表提供中文释义（300 / 500 / 紧急 100，取并集，先到先得）
  const meaningByWord = new Map();
  for (const f of [
    'cet6_core_words_top300_simple.md',
    'cet6_core_words_top500_simple.md',
    'cet6_emergency_words_top100_simple.md'
  ]) {
    const map = parseSimpleMdMeanings(path.join(cet6Dir, f));
    for (const [word, meaning] of map) {
      if (!meaningByWord.has(word)) meaningByWord.set(word, meaning);
    }
  }

  const entries = [];
  let withMeaning = 0;
  for (const row of rows) {
    const word = row.word;
    const mdMeaning = meaningByWord.get(String(word).toLowerCase());
    const meanings = mdMeaning
      ? mdMeaning
          .split(/[；;]/)
          .map((d) => d.trim())
          .filter(Boolean)
          .map((d) => ({ pos: row.part_of_speech || '', definition: d, frequency: '' }))
      : [];
    if (meanings.length) withMeaning += 1;

    const examples = row.example_sentence_from_exam
      ? [{ en: row.example_sentence_from_exam.trim(), cn: '' }]
      : [];

    entries.push(
      buildEntry(
        {
          word,
          meanings
        },
        examples,
        ['cet6']
      )
    );
  }

  return {
    name: 'cet6-vocabulary',
    total: rows.length,
    filteredOut: 0,
    extra: { withMeaning },
    entries
  };
}

// ---------------------------------------------------------------------------
// 4. 统一合并：去重（existing words.js 优先）+ 输出
// ---------------------------------------------------------------------------

// 现有词库（仅用于去重，不修改原文件）
let existingWords = [];
try {
  existingWords = require(EXISTING_SEED_FILE).words || [];
} catch (err) {
  console.error(`[错误] 无法读取现有词库 ${EXISTING_SEED_FILE}：${err.message}`);
  process.exit(1);
}

const seen = new Set(existingWords.map((w) => String(w.word).toLowerCase()));
const merged = [];
const sourceReports = [];

function ingest(source) {
  const report = {
    name: source.name,
    total: source.total,
    filteredOut: source.filteredOut || 0,
    skipped: 0,
    added: 0,
    withExamples: 0,
    withSyllabus: 0,
    ...(source.extra || {})
  };
  for (const entry of source.entries) {
    const key = String(entry.word).toLowerCase();
    if (!key) continue;
    if (entry.syllabus.length === 0) {
      report.filteredOut += 1;
      continue;
    }
    if (seen.has(key)) {
      report.skipped += 1;
      continue;
    }
    seen.add(key);
    merged.push(entry);
    report.added += 1;
    if (entry.examples.length > 0) report.withExamples += 1;
    if (entry.syllabus.length > 0) report.withSyllabus += 1;
  }
  sourceReports.push(report);
}

console.log('正在加载 english-vocabulary…');
const evDir = resolveEnglishVocabDir();
ingest(loadEnglishVocabulary(evDir));

console.log('正在加载 dict-master（有道词书）…');
ingest(loadDictMaster(DICT_DIR));

console.log('正在加载 cet6-vocabulary（六级真题高频词）…');
ingest(loadCet6Vocabulary(CET6_DIR));

// 写出 words_merged.js（每个词条一行，便于审查）
console.log('正在写入输出文件…');
const lines = merged.map((entry) => '  ' + JSON.stringify(entry));
const content =
  '// 本文件由 scripts/mergeVocabulary.js 自动生成，请勿手工修改。\n' +
  '// 数据源：english-vocabulary / dict-master / cet6-vocabulary\n' +
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
// 5. 统计信息
// ---------------------------------------------------------------------------
const totalWithExamples = merged.filter((w) => w.examples.length > 0).length;
const totalWithSyllabus = merged.filter((w) => w.syllabus.length > 0).length;

console.log('\n========== 合并完成 ==========');
console.log(`原词库词条数          ：${existingWords.length}`);
for (const r of sourceReports) {
  console.log(`── ${r.name} ──`);
  if (r.bookCount != null) {
    console.log(`  处理的词书数        ：${r.bookCount}（跳过非允许考纲词书 ${r.skippedBooks} 本）`);
  }
  console.log(`  词条总数            ：${r.total}`);
  if (r.filteredOut) console.log(`  被考纲筛选丢弃词条数：${r.filteredOut}`);
  if (r.withMeaning != null) console.log(`  其中含中文释义词条数：${r.withMeaning}`);
  console.log(`  重复跳过词条数      ：${r.skipped}`);
  console.log(`  成功新增词条数      ：${r.added}`);
}
console.log('--------------------------------');
console.log(`合并后总词条数        ：${merged.length}`);
console.log(`其中包含例句的单词数  ：${totalWithExamples}`);
console.log(`其中包含考纲标签的单词数：${totalWithSyllabus}`);
console.log(`输出文件              ：${OUTPUT_FILE}`);
console.log(`输出文件大小          ：${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
