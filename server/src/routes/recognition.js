const express = require('express');
const multer = require('multer');
const { getDb } = require('../db');
const { recognizeImage, demoResult } = require('../services/ocr');
const { extractAndMatch } = require('../services/extractor');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// 拍照/图片导入识别：multipart/form-data，字段 image；可用 mockText 直接传题目文本（测试/演示）
router.post('/', upload.single('image'), async (req, res) => {
  const { syllabus, mockText } = req.body;
  const db = getDb();

  let ocrResult = null;
  if (mockText && mockText.trim()) {
    ocrResult = { text: mockText.trim(), engine: 'demo' };
  } else if (req.file) {
    ocrResult = await recognizeImage(req.file.buffer);
    if (!ocrResult.text) {
      const fallback = demoResult();
      ocrResult = { ...fallback, fallback: true, reason: ocrResult.error || '识别失败' };
    }
  } else {
    return res.status(400).json({ error: '请上传图片或提供 mockText' });
  }

  const matched = extractAndMatch({
    text: ocrResult.text,
    words: db.words,
    phrases: db.phrases,
    syllabusId: syllabus || null,
    wordbook: db.wordbook
  });

  res.json({
    syllabus: syllabus || null,
    engine: ocrResult.engine,
    fallback: ocrResult.fallback || false,
    reason: ocrResult.reason || null,
    rawText: ocrResult.text,
    ...matched
  });
});

module.exports = router;
