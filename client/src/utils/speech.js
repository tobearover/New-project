import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 统一发音服务（企业级单一入口，全站复用）：
 * 1) 优先播放真实音频（有道词典 mp3），词/词组在安卓/微信均可出声；
 * 2) 音频失败 -> 等待 SpeechSynthesis 语音就绪 -> 合成兜底；
 * 3) 均失败自动延迟 500ms 重试一次；语速统一 0.9。
 *
 * 对外提供：
 * - useSpeech()：带 loading/playing 状态的 Hook（SpeakButton、详情页）
 * - speakText()：无状态的一次性播放（测验/复习自动朗读）
 */
const YOUD_BASE = 'https://dict.youdao.com/dictvoice';
const AUDIO_TIMEOUT_MS = 8000;
const RETRY_DELAY_MS = 500;
const VOICE_READY_TIMEOUT_MS = 1500;
const DEFAULT_RATE = 0.9;

let activeAudio = null;
let activeUtterance = null;
let voiceReadyPromise = null;

/** 有道词典音频地址：type=2 美音，type=1 英音 */
export function youdaoAudioUrl(text, accent = 'US') {
  const type = accent === 'UK' ? 1 : 2;
  return `${YOUD_BASE}?audio=${encodeURIComponent(text)}&type=${type}`;
}

export function supportsSpeechSynthesis() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** 等待移动端语音包就绪：getVoices 非空或 voiceschanged 触发，超时兜底 */
export function ensureVoicesReady(timeoutMs = VOICE_READY_TIMEOUT_MS) {
  if (!supportsSpeechSynthesis()) return Promise.resolve(false);
  if (window.speechSynthesis.getVoices().length > 0) return Promise.resolve(true);
  if (voiceReadyPromise) return voiceReadyPromise;
  voiceReadyPromise = new Promise((resolve) => {
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      window.speechSynthesis.removeEventListener('voiceschanged', onChange);
      resolve(ok);
    };
    const onChange = () => {
      if (window.speechSynthesis.getVoices().length > 0) finish(true);
    };
    const timer = setTimeout(() => finish(window.speechSynthesis.getVoices().length > 0), timeoutMs);
    window.speechSynthesis.addEventListener('voiceschanged', onChange);
  });
  return voiceReadyPromise;
}

/** 选择最合适的英文 voice：优先 Google/Microsoft 的精确语音，其次任意 en voice */
function pickVoice(lang) {
  try {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const prefix = String(lang).toLowerCase().startsWith('en-gb') ? 'en-gb' : 'en-us';
    const preferred = voices.find(
      (v) => v.lang === prefix && /google|microsoft|natural/i.test(v.name)
    );
    if (preferred) return preferred;
    const exact = voices.find((v) => v.lang === prefix);
    if (exact) return exact;
    return voices.find((v) => String(v.lang || '').toLowerCase().startsWith('en')) || null;
  } catch {
    return null;
  }
}

/** 停止独立播放（speakText 使用） */
function cancelTextPlayback() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.src = '';
    } catch {
      /* ignore */
    }
    activeAudio = null;
  }
  if (activeUtterance && supportsSpeechSynthesis()) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
}

/**
 * 播放一段真实音频。
 * register 用于让调用方拿到实例以便中途停止；返回 true=完整播放结束，false=失败/超时。
 */
function playAudioFile(url, register, playbackRate = DEFAULT_RATE) {
  return new Promise((resolve) => {
    let settled = false;
    const audio = new Audio();
    try {
      audio.playbackRate = playbackRate;
    } catch {
      /* ignore */
    }
    if (typeof register === 'function') register(audio);
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      audio.onended = null;
      audio.onerror = null;
      resolve(ok);
    };
    const timer = setTimeout(() => {
      try {
        audio.pause();
      } catch {
        /* ignore */
      }
      finish(false);
    }, AUDIO_TIMEOUT_MS);
    audio.onerror = () => finish(false);
    audio.onended = () => finish(true);
    audio.src = url;
    audio.play().catch(() => finish(false));
  });
}

/** 用合成语音朗读；等待语音就绪、选择 voice、超时判定是否真正开始 */
function speakWithSynthesis(content, lang, rate) {
  return new Promise((resolve) => {
    if (!supportsSpeechSynthesis()) return resolve(false);
    ensureVoicesReady().then(() => {
      let started = false;
      const u = new SpeechSynthesisUtterance(content);
      u.lang = lang;
      u.rate = rate;
      const voice = pickVoice(lang);
      if (voice) u.voice = voice;
      const finish = (ok) => {
        if (started && ok === false) return; // onerror 后 onend 可能尾随，忽略
        if (activeUtterance === u) activeUtterance = null;
        clearTimeout(startTimer);
        u.onstart = null;
        u.onend = null;
        u.onerror = null;
        resolve(ok);
      };
      u.onstart = () => {
        started = true;
        clearTimeout(startTimer);
      };
      u.onend = () => finish(true);
      u.onerror = () => finish(false);
      activeUtterance = u;
      // 500ms 内未真正开始视为失败（如语音未就绪/被系统静音拦截）
      const startTimer = setTimeout(() => {
        if (!started) finish(false);
      }, 500);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    });
  });
}

/** 尝试播放，失败延迟 500ms 重试一次 */
async function attempt(text, lang, rate) {
  const accent = String(lang).toLowerCase().startsWith('en-gb') ? 'UK' : 'US';
  const first = await playAudioFile(youdaoAudioUrl(text, accent), null, rate);
  if (first) return true;
  await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  const second = await playAudioFile(youdaoAudioUrl(text, accent), null, rate);
  if (second) return true;

  if (!supportsSpeechSynthesis()) return false;
  const ttsFirst = await speakWithSynthesis(text, lang, rate);
  if (ttsFirst) return true;
  await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  return speakWithSynthesis(text, lang, rate);
}

/**
 * 一次性播放（无状态）：返回是否成功出声（音频播完或合成已开始/结束）。
 */
export async function speakText(text, lang = 'en-US', rate = DEFAULT_RATE) {
  const content = String(text || '').trim();
  if (!content) return false;
  cancelTextPlayback();
  return attempt(content, lang, rate);
}

/** 带状态反馈的发音 Hook（SpeakButton / 详情页使用） */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(null); // 正在朗读的文本
  const [loading, setLoading] = useState(false);
  const currentRef = useRef(null); // { text, audio, utterance }

  const stop = useCallback(() => {
    const cur = currentRef.current;
    if (cur && cur.audio) {
      try {
        cur.audio.pause();
        cur.audio.src = '';
      } catch {
        /* ignore */
      }
    }
    if (supportsSpeechSynthesis()) window.speechSynthesis.cancel();
    currentRef.current = null;
    setSpeaking(null);
    setLoading(false);
  }, []);

  const speak = useCallback(
    async (text, lang = 'en-US', rate = DEFAULT_RATE) => {
      const content = String(text || '').trim();
      if (!content) return;

      // 同一文本再次触发 = 停止；否则先停旧任务
      if (currentRef.current && currentRef.current.text === content) {
        stop();
        return;
      }
      stop();
      setLoading(true);
      setSpeaking(content);

      const accent = String(lang).toLowerCase().startsWith('en-gb') ? 'UK' : 'US';
      const ok = await playAudioFile(youdaoAudioUrl(content, accent), (audio) => {
        currentRef.current = { text: content, audio, utterance: null };
      }, rate);
      if (currentRef.current && currentRef.current.text !== content) return; // 已被停止
      if (ok) {
        currentRef.current = null;
        setSpeaking(null);
        setLoading(false);
        return;
      }

      // 音频失败：500ms 后重试音频一次
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      if (currentRef.current && currentRef.current.text !== content) return;
      const ok2 = await playAudioFile(youdaoAudioUrl(content, accent), (audio) => {
        currentRef.current = { text: content, audio, utterance: null };
      }, rate);
      if (currentRef.current && currentRef.current.text !== content) return;
      if (ok2) {
        currentRef.current = null;
        setSpeaking(null);
        setLoading(false);
        return;
      }

      // 合成兜底
      if (!supportsSpeechSynthesis()) {
        setSpeaking(null);
        setLoading(false);
        return;
      }
      await ensureVoicesReady();
      if (currentRef.current && currentRef.current.text !== content) return;

      const playTts = () =>
        new Promise((resolve) => {
          let started = false;
          const u = new SpeechSynthesisUtterance(content);
          u.lang = lang;
          u.rate = rate;
          const voice = pickVoice(lang);
          if (voice) u.voice = voice;
          const finish = (ok, clearState) => {
            clearTimeout(startTimer);
            u.onstart = null;
            u.onend = null;
            u.onerror = null;
            if (currentRef.current && currentRef.current.text === content && clearState) {
              currentRef.current = null;
              setSpeaking(null);
              setLoading(false);
            }
            resolve(ok);
          };
          u.onstart = () => {
            started = true;
            clearTimeout(startTimer);
          };
          u.onend = () => finish(true, true);
          u.onerror = () => finish(false, true);
          currentRef.current = { text: content, audio: null, utterance: u };
          const startTimer = setTimeout(() => {
            if (!started) finish(false, true);
          }, 500);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        });

      const ttsOk = await playTts();
      if (ttsOk) return;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      if (currentRef.current && currentRef.current.text !== content) return;
      await playTts();
    },
    [stop]
  );

  // 卸载时清理
  useEffect(() => () => stop(), [stop]);

  return { speaking, loading, speak, stop };
}

/** 提取字符串中的英文部分（用于“搭配/词组”这类中英混合内容只朗读英文） */
export function englishPart(text) {
  const m = String(text || '').match(/^[A-Za-z'’\- ]+/);
  return m ? m[0].trim() : '';
}
