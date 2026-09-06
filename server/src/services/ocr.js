/**
 * OCR 服务 —— 阿里云文字识别（通用印刷体识别 RecognizeGeneral）
 *
 * 环境变量：
 *   ALIYUN_ACCESS_KEY_ID / ALIYUN_AK / ALIYUN_AK_ID        阿里云 AccessKeyId
 *   ALIYUN_ACCESS_KEY_SECRET / ALIYUN_SK / ALIYUN_AK_SECRET 阿里云 AccessKeySecret
 *   ALIYUN_OCR_REGION                        区域（默认 cn-hangzhou）
 *   ALIYUN_OCR_ENDPOINT                      自定义 endpoint（可选，默认 ocr-api.<region>.aliyuncs.com）
 *
 * 失败策略：抛出具可读信息的 Error，由路由层返回错误与重试提示，
 * 禁止静默回退到演示文本。所有日志只记录“是否存在”与环境状态，不打印密钥值。
 */

const crypto = require("crypto");
const https = require("https");

const DEFAULT_REGION = "cn-hangzhou";
const OCR_ACTION = "RecognizeGeneral";
const OCR_VERSION = "2021-07-07";
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 阿里云 OCR 图片上限（约 4MB）
const REQUEST_TIMEOUT_MS = parseInt(process.env.ALIYUN_OCR_TIMEOUT_MS || "10000", 10);
const OCR_RETRY_ONCE = process.env.ALIYUN_OCR_RETRY !== "0"; // 网络/5xx 抖动时重试一次

/** OCR 分级错误：kind 供路由层区分网络/鉴权/服务/内容问题 */
class OcrError extends Error {
  constructor(kind, message, retryable) {
    super(message);
    this.name = "OcrError";
    this.kind = kind;
    this.retryable = retryable !== false;
  }
}

/** 结构化日志：只记录是否存在与环境状态，绝不输出 AK/SK 等敏感值 */
function logOcr(step, info) {
  const safe = { step, time: new Date().toISOString(), ...info };
  try {
    if (safe.query) delete safe.query; // 查询串含签名，不进日志
    if (safe.headers) delete safe.headers;
    if (safe.url) safe.host = String(safe.url).replace(/^https:\/\//, "").split("/")[0];
    delete safe.url;
  } catch {}
  console.log("[OCR]", JSON.stringify(safe));
}

/** 输出错误现场但隐藏凭证：提取 code/message/status 即可 */
function logError(step, err) {
  const payload = {
    step,
    kind: err && err.kind,
    retryable: err && err.retryable,
    message: err && err.message,
    code: err && err.code,
    status: err && err.status,
  };
  if (err && err.detail) payload.detail = err.detail;
  console.error("[OCR:ERROR]", JSON.stringify(payload));
}

function getConfig() {
  const region = process.env.ALIYUN_OCR_REGION || DEFAULT_REGION;
  return {
    accessKeyId:
      process.env.ALIYUN_ACCESS_KEY_ID ||
      process.env.ALIYUN_AK ||
      process.env.ALIYUN_AK_ID ||
      "",
    accessKeySecret:
      process.env.ALIYUN_ACCESS_KEY_SECRET ||
      process.env.ALIYUN_SK ||
      process.env.ALIYUN_AK_SECRET ||
      "",
    region,
    endpoint:
      process.env.ALIYUN_OCR_ENDPOINT || `ocr-api.${region}.aliyuncs.com`,
  };
}

function hasCredentials(config) {
  return Boolean(config.accessKeyId && config.accessKeySecret);
}

/** RFC 3986 百分号编码（阿里云 RPC 签名要求大写十六进制） */
function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/\+/g, "%20")
    .replace(/%7E/g, "~")
    .replace(/\*/g, "%2A");
}

/** 阿里云 RPC 签名：HMAC-SHA1，密钥为 AccessKeySecret + '&' */
function signRequest(method, queryParams, accessKeySecret) {
  const canonicalizedQuery = Object.keys(queryParams)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(queryParams[key])}`)
    .join("&");
  const stringToSign = `${method}&${percentEncode("/")}&${percentEncode(canonicalizedQuery)}`;
  return crypto
    .createHmac("sha1", `${accessKeySecret}&`)
    .update(stringToSign)
    .digest("base64");
}

/** 发起 HTTPS 请求并返回 JSON */
function httpsRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8");
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
      req.destroy(new Error("阿里云 OCR 请求超时"));
    });
    req.on("error", (err) => reject(err));
    if (body) req.write(body);
    req.end();
  });
}

/** 从阿里云响应中提取文本（兼容 prism_wordsInfo 与 content 两种返回结构） */
function extractText(data) {
  if (!data) return "";
  if (typeof data === "string") {
    const plain = data.trim();
    return plain && plain !== "{}" ? plain : "";
  }
  if (Array.isArray(data.prism_wordsInfo)) {
    const text = data.prism_wordsInfo
      .map((w) => (w && w.word ? w.word : ""))
      .filter(Boolean)
      .join("\n");
    if (text.trim()) return text.trim();
  }
  if (typeof data.content === "string" && data.content.trim())
    return data.content.trim();
  return "";
}

/**
 * 识别图片：返回 { text, engine: 'aliyun' }
 * 任何失败（无凭证 / 网络 / API 错误 / 无识别文字）都会抛出可读 Error。
 */
async function recognizeImage(buffer) {
  const config = getConfig();
  logOcr("start", {
    hasAk: !!config.accessKeyId,
    hasSk: !!config.accessKeySecret,
    region: config.region,
    endpoint: config.endpoint,
    imageBytes: buffer ? buffer.length : 0,
    hasDataPrefix: buffer ? buffer.slice(0, 64).includes(Buffer.from("data:image")) : false,
  });
  if (!hasCredentials(config)) {
    const err = new OcrError(
      "missing_credentials",
      "未配置阿里云 OCR 凭证（请设置 ALIYUN_ACCESS_KEY_ID / ALIYUN_ACCESS_KEY_SECRET）",
      false,
    );
    logError("missing_credentials", err);
    throw err;
  }
  if (!buffer || buffer.length === 0) {
    const err = new OcrError("invalid_input", "图片内容为空", false);
    logError("invalid_input", err);
    throw err;
  }
  if (buffer.length > MAX_IMAGE_BYTES) {
    const err = new OcrError(
      "invalid_input",
      `图片过大（${(buffer.length / 1024 / 1024).toFixed(1)}MB），阿里云 OCR 上限为 4MB`,
      false,
    );
    logError("invalid_input", err);
    throw err;
  }

  const params = {
    AccessKeyId: config.accessKeyId,
    Action: OCR_ACTION,
    Format: "JSON",
    RegionId: config.region,
    SignatureMethod: "HMAC-SHA1",
    SignatureNonce: crypto.randomUUID(),
    SignatureVersion: "1.0",
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    Version: OCR_VERSION,
  };
  const signature = signRequest("POST", params, config.accessKeySecret);
  const query = new URLSearchParams({
    ...params,
    Signature: signature,
  }).toString();

  const url = `https://${config.endpoint}/?${query}`;
  // 2021-07-07 版 RecognizeGeneral：POST 体为图片原始字节流
  const body = buffer;

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": Buffer.byteLength(body),
      Accept: "application/json",
    },
  };

  logOcr("request", {
    endpoint: config.endpoint,
    action: OCR_ACTION,
    version: OCR_VERSION,
    imageBytes: body.length,
    timeoutMs: REQUEST_TIMEOUT_MS,
  });

  // 网络失败 / 5xx 抖动时重试一次（幂等 POST 原始字节流）
  let result;
  let lastNetworkError = null;
  for (let attempt = 0; attempt < (OCR_RETRY_ONCE ? 2 : 1); attempt += 1) {
    try {
      result = await httpsRequest(url, requestOptions, body);
      lastNetworkError = null;
      break;
    } catch (err) {
      lastNetworkError = err;
      logError(`network_attempt_${attempt + 1}`, err);
      if (attempt === 0 && OCR_RETRY_ONCE) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }
  if (!result) {
    const detail = lastNetworkError && (lastNetworkError.message || lastNetworkError.code);
    const err = new OcrError(
      "network",
      `阿里云 OCR 调用失败：${detail || "网络请求失败"}（请检查服务器出网连通性）`,
      true,
    );
    logError("network_failed", err);
    throw err;
  }

  logOcr("response", {
    status: result.status,
    hasJson: !!result.json,
    rawBytes: result.raw ? result.raw.length : 0,
  });

  if (result.status === 401 || result.status === 403) {
    const msg =
      (result.json && (result.json.Message || result.json.message)) ||
      "鉴权失败";
    const err = new OcrError(
      "auth",
      `阿里云 OCR 鉴权失败（${result.status}）：${msg}（请检查 AK/SK 与权限）`,
      false,
    );
    err.status = result.status;
    err.detail = { status: result.status, code: result.json && (result.json.Code || result.json.code), message: msg };
    logError("auth_failed", err);
    throw err;
  }
  if (result.status !== 200 || !result.json) {
    const msg =
      (result.json && (result.json.Message || result.json.message)) ||
      result.raw ||
      "未知错误";
    const retryable = result.status >= 500 || !result.json;
    const err = new OcrError(
      retryable ? "service" : "request",
      `阿里云 OCR 请求失败（HTTP ${result.status}）：${msg}`,
      retryable,
    );
    err.status = result.status;
    err.detail = { status: result.status, code: result.json && (result.json.Code || result.json.code), message: msg };
    logError("request_failed", err);
    throw err;
  }

  // 业务错误（如未开通服务 / 欠费 / 图片不合规）
  if (result.json.Code || result.json.code) {
    const code = result.json.Code || result.json.code;
    const msg = result.json.Message || result.json.message || "";
    const err = new OcrError(
      "service",
      `阿里云 OCR 返回错误 ${code}：${msg || "请检查服务开通状态与账户余额"}`,
      false,
    );
    err.detail = { status: result.status, code, message: msg };
    logError("service_error", err);
    throw err;
  }

  // RecognizeGeneral（2021-07-07）的 Data 是“字符串化的 JSON”，需先反序列化再提取
  let data = result.json.Data || result.json.data;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = null;
    }
  }
  const text = extractText(data);
  if (!text) {
    // 仅空结果时输出原始响应便于排查返回结构（响应体不含凭证）
    logOcr("empty_response_body", {
      body: typeof result.raw === "string" ? result.raw.slice(0, 1200) : "",
    });
    const err = new OcrError("content", "阿里云 OCR 未识别到文字，请更换更清晰的图片重试", true);
    logError("empty_result", err);
    throw err;
  }
  logOcr("success", { chars: text.length });
  return { text, engine: "aliyun" };
}

module.exports = { recognizeImage };
