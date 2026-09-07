import { useCallback, useRef, useState } from 'react';

/**
 * 发音双通道方案：
 * 1) 优先播放真实音频文件（有道词典 mp3，词/词组发音，Android/微信均可播放）；
 * 2) 音频不可用时回退浏览器 Web Speech（SpeechSynthesis），兼容桌面/iOS。
 *
 * 背景：部分 Android 设备/内置浏览器没有可用的英文合成语音，speechSynthesis 静默无声。
 */
const YOUD_BASE = 'https://dict.youdao.com/dictvoice';
const AUDIO_TIMEOUT_MS = 8000;
let activeAudio = null;
let activeUtterance = null;

/** 有道词典音频地址：type=2 美音，type=1 英音 */
export function youdaoAudioUrl(text, accent = 'US') {
  const type = accent === 'UK' ? 1 : 2;
  return `${YOUD_BASE}?audio=${encodeURIComponent(text)}&type=${type}`;
}

export function supportsSpeechSynthesis() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** 停止独立播放（speakText 使用）：音频 + 合成语音一起清 */
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

/** 播放一段真实音频，结束返回 true，加载失败/超时返回 false */
function playAudioFile(url, register) {
  return new Promise((resolve) => {
    let settled = false;
    const audio = new Audio();
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

/**
 * 播放单词/词组文本：
 * - 先试有道音频（真实录音，解决安卓/微信无合成语音的问题）；
 * - 失败则回退 SpeechSynthesis；两者都不可用返回 false。
 */
export async function speakText(text, lang = 'en-US', rate = 0.85) {
  const content = String(text || '').trim();
  if (!content) return false;
  const accent = String(lang).toLowerCase().startsWith('en-gb') ? 'UK' : 'US';

  cancelTextPlayback();

  const ok = await playAudioFile(youdaoAudioUrl(content, accent), (audio) => {
    activeAudio = audio;
  });
  if (activeAudio) activeAudio = null;
  if (ok) return true;

  if (!supportsSpeechSynthesis()) return false;
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(content);
    u.lang = lang;
    u.rate = rate;
    activeUtterance = u;
    u.onend = () => {
      activeUtterance = null;
      resolve(true);
    };
    u.onerror = () => {
      activeUtterance = null;
      resolve(false);
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  });
}

/** 带状态反馈的发音 Hook：返回当前朗读文本 + speak/stop（供 SpeakButton/详情页使用） */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(null);
  const currentRef = useRef(null); // { text, audio, tts }

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
  }, []);

  const speak = useCallback(
    async (text, lang = 'en-US', rate = 0.85) => {
      const content = String(text || '').trim();
      if (!content) return;

      // 同一文本再次点击 = 停止
      if (currentRef.current && currentRef.current.text === content) {
        stop();
        return;
      }
      stop();
      setSpeaking(content);

      const accent = String(lang).toLowerCase().startsWith('en-gb') ? 'UK' : 'US';
      const ok = await playAudioFile(youdaoAudioUrl(content, accent), (audio) => {
        currentRef.current = { text: content, audio, tts: null };
      });
      if (currentRef.current && currentRef.current.text !== content) return; // 期间被停止
      if (ok) {
        currentRef.current = null;
        setSpeaking(null);
        return;
      }

      if (!supportsSpeechSynthesis()) {
        setSpeaking(null);
        return;
      }
      const u = new SpeechSynthesisUtterance(content);
      u.lang = lang;
      u.rate = rate;
      u.onend = () => {
        if (currentRef.current && currentRef.current.text === content) setSpeaking(null);
      };
      u.onerror = () => {
        if (currentRef.current && currentRef.current.text === content) setSpeaking(null);
      };
      currentRef.current = { text: content, audio: null, tts: u };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    },
    [stop]
  );

  return { speaking, speak, stop };
}

/** 提取字符串中的英文部分（用于“搭配/词组”这类中英混合内容只朗读英文） */
export function englishPart(text) {
  const m = String(text || '').match(/^[A-Za-z'’\- ]+/);
  return m ? m[0].trim() : '';
}
