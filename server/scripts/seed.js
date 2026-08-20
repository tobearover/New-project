const path = require('path');
const { ensureDb } = require('../src/db');
const { mergedCount } = require('../src/seed/mergedAdapter');

const db = ensureDb();
console.log(`种子数据就绪：${db.syllabi.length} 个考纲，${db.words.length} 个单词，${db.phrases.length} 个词组`);
console.log(`其中由开源词库合并新增：${mergedCount} 词（words_merged.js）`);
console.log(`数据库文件：${path.join(__dirname, '..', 'data', 'db.json')}`);
