/**
 * OCR 服务 —— 阿里云文字识别（通用印刷体识别 RecognizeGeneral）
 *
 * 环境变量：
 *   ALIYUN_ACCESS_KEY_ID / ALIYUN_AK        阿里云 AccessKeyId
 *   ALIYUN_ACCESS_KEY_SECRET / ALIYUN_SK    阿里云 AccessKeySecret
 *   ALIYUN_OCR_REGION                        区域（默认 cn-hangzhou）
 *   ALIYUN_OCR_ENDPOINT                      自定义 endpoint（可选，默认 ocr-api.<region>.aliyuncs.com）
 *
 * 失败策略：抛出具可读信息的 Error，由路由层返回错误与重试提示，
 * 禁止静默回退到演示文本。
 */

const crypto = require('crypto');
const https = require('https');

const DEFAULT_REGION = 'cn-hangzhou';
const OCR_ACTION = 'RecognizeGeneral';
const OCR_VERSION = '2021-07-07';
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 阿里云 OCR 图片上限（约 4MB）
const REQUEST_TIMEOUT_MS = 30000;

function getConfig() {
  const region = process.env.ALIYUN_OCR_REGION || DEFAULT_REGION;
  return {
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || process.env.ALIYUN_AK || '',
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || process.env.ALIYUN_SK || '',
    region,
    endpoint: process.env.ALIYUN_OCR_ENDPOINT || `ocr-api.${region}.aliyuncs.com`
  };
}

function hasCredentials(config) {
  return Boolean(config.accessKeyId && config.accessKeySecret);
}

/** RFC 3986 百分号编码（阿里云 RPC 签名要求大写十六进制） */
function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/\+/g, '%20')
    .replace(/%7E/g, '~')
    .replace(/\*/g, '%2A');
}

/** 阿里云 RPC 签名：HMAC-SHA1，密钥为 AccessKeySecret + '&' */
function signRequest(method, queryParams, accessKeySecret) {
  const canonicalizedQuery = Object.keys(queryParams)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(queryParams[key])}`)
    .join('&');
  const stringToSign = `${method}&${percentEncode('/')}&${percentEncode(canonicalizedQuery)}`;
  return crypto
    .createHmac('sha1', `${accessKeySecret}&`)
    .update(stringToSign)
    .digest('base64');
}

/** 发起 HTTPS 请求并返回 JSON */
function httpsRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try {
          json = JSON.parse(raw);
        } catch {
          json = null;
        }
        resolve({ status: res.statusCode, json, raw });
      });
    });
    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error('阿里云 OCR 请求超时'));
    });
    req.on('error', (err) => reject(err));
    if (body) req.write(body);
    req.end();
  });
}

/** 从阿里云响应中提取文本（兼容 prism_wordsInfo 与 content 两种返回结构） */
function extractText(data) {
  if (!data) return '';
  if (Array.isArray(data.prism_wordsInfo)) {
    const text = data.prism_wordsInfo
      .map((w) => (w && w.word ? w.word : ''))
      .filter(Boolean)
      .join('\n');
    if (text.trim()) return text.trim();
  }
  if (typeof data.content === 'string' && data.content.trim()) return data.content.trim();
  return '';
}

/**
 * 识别图片：返回 { text, engine: 'aliyun' }
 * 任何失败（无凭证 / 网络 / API 错误 / 无识别文字）都会抛出可读 Error。
 */
async function recognizeImage(buffer) {
  const config = getConfig();
  if (!hasCredentials(config)) {
    throw new Error('未配置阿里云 OCR 凭证（请设置 ALIYUN_ACCESS_KEY_ID / ALIYUN_ACCESS_KEY_SECRET）');
  }
  if (!buffer || buffer.length === 0) {
    throw new Error('图片内容为空');
  }
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new Error(`图片过大（${(buffer.length / 1024 / 1024).toFixed(1)}MB），阿里云 OCR 上限为 4MB`);
  }

  const params = {
    AccessKeyId: config.accessKeyId,
    Action: OCR_ACTION,
    Format: 'JSON',
    RegionId: config.region,
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: crypto.randomUUID(),
    SignatureVersion: '1.0',
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    Version: OCR_VERSION
  };
  const signature = signRequest('POST', params, config.accessKeySecret);
  const query = new URLSearchParams({
    ...params,
    Signature: signature
  }).toString();

  const url = `https://${config.endpoint}/?${query}`;
  // 2021-07-07 版 RecognizeGeneral：POST 体为图片原始字节流
  const body = buffer;

  let result;
  try {
    result = await httpsRequest(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': Buffer.byteLength(body),
          Accept: 'application/json'
        }
      },
      body
    );
  } catch (err) {
    const detail = err.message || err.code || '网络请求失败';
    throw new Error(`阿里云 OCR 调用失败：${detail}（请检查服务器出网连通性）`);
  }

  if (result.status === 401 || result.status === 403) {
    const msg = (result.json && (result.json.Message || result.json.message)) || '鉴权失败';
    throw new Error(`阿里云 OCR 鉴权失败（${result.status}）：${msg}（请检查 AK/SK 与权限）`);
  }
  if (result.status !== 200 || !result.json) {
    const msg = (result.json && (result.json.Message || result.json.message)) || result.raw || '未知错误';
    throw new Error(`阿里云 OCR 请求失败（HTTP ${result.status}）：${msg}`);
  }

  // 业务错误（如未开通服务 / 欠费 / 图片不合规）
  if (result.json.Code || result.json.code) {
    const code = result.json.Code || result.json.code;
    const msg = result.json.Message || result.json.message || '';
    throw new Error(`阿里云 OCR 返回错误 ${code}：${msg || '请检查服务开通状态与账户余额'}`);
  }

  const text = extractText(result.json.Data || result.json.data);
  if (!text) {
    throw new Error('阿里云 OCR 未识别到文字，请更换更清晰的图片重试');
  }
  return { text, engine: 'aliyun' };
}

module.exports = { recognizeImage };
