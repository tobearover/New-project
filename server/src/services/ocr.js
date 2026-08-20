const Tesseract = require('tesseract.js');

const DEMO_TEXT = [
  'In recent years, technology has transformed the way students learn.',
  'Many universities provide free access to online resources.',
  'To achieve success, learners should focus on essential skills and develop a clear strategy.',
  'The impact of digital education is significant, and experts believe it will continue to expand.',
  'However, some students find it difficult to adapt to the new environment and must maintain a balance between study and rest.',
  'Online courses offer a flexible alternative, allowing learners to participate at their own pace.'
].join('\n');

// 使用 tesseract.js 本地识别；失败时回退到演示文本
async function recognizeImage(buffer, timeoutMs = 60000) {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve({ text: null, engine: 'tesseract', error: 'OCR 超时' }), timeoutMs);
  });

  const job = (async () => {
    try {
      const { data } = await Tesseract.recognize(buffer, 'eng', {
        logger: () => {}
      });
      return { text: (data.text || '').trim(), engine: 'tesseract' };
    } catch (err) {
      return { text: null, engine: 'tesseract', error: err && err.message ? err.message : String(err) };
    }
  })();

  const result = await Promise.race([job, timeout]);
  clearTimeout(timer);
  return result;
}

function demoResult() {
  return { text: DEMO_TEXT, engine: 'demo' };
}

module.exports = { recognizeImage, demoResult, DEMO_TEXT };
