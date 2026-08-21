import { useCallback, useState } from 'react';

/**
 * Web Speech API（SpeechSynthesis）封装：
 * 播放/停止、播放状态反馈；同一实例同时只播放一段文本。
 */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(null); // 当前正在朗读的文本

  const speak = useCallback(
    (text, lang = 'en-US', rate = 0.85) => {
      if (!text || !('speechSynthesis' in window)) return;
      if (speaking === text) {
        window.speechSynthesis.cancel();
        setSpeaking(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.onstart = () => setSpeaking(text);
      utterance.onend = () => setSpeaking(null);
      utterance.onerror = () => setSpeaking(null);
      window.speechSynthesis.speak(utterance);
    },
    [speaking]
  );

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(null);
  }, []);

  return { speaking, speak, stop };
}

/** 提取字符串中的英文部分（用于"搭配/词组"这类中英混合内容只朗读英文） */
export function englishPart(text) {
  const m = String(text || '').match(/^[A-Za-z'’\- ]+/);
  return m ? m[0].trim() : '';
}
