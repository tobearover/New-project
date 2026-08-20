import React, { useRef } from 'react';

const ACCENTS = {
  UK: 'en-GB',
  US: 'en-US'
};

export default function SpeakButton({ word, accent = 'US', size = 'md', label }) {
  const busy = useRef(false);

  const speak = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!('speechSynthesis' in window)) return;
    if (busy.current) {
      window.speechSynthesis.cancel();
      busy.current = false;
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = ACCENTS[accent] || 'en-US';
    u.rate = 0.85;
    u.onend = () => (busy.current = false);
    u.onerror = () => (busy.current = false);
    busy.current = true;
    window.speechSynthesis.speak(u);
  };

  const sizeCls = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm';
  return (
    <button
      type="button"
      onClick={speak}
      title={`播放发音（${accent}）`}
      aria-label={`播放 ${word} 的${accent}发音`}
      className={`${sizeCls} inline-flex shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-100 hover:bg-brand-100 transition`}
    >
      🔊
    </button>
  );
}
