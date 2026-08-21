import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSpeech } from '../utils/speech';

const ACCENTS = {
  UK: 'en-GB',
  US: 'en-US'
};

/**
 * 单词/词组发音按钮（Web Speech API）
 * props: word | text（朗读内容），accent（US/UK），size（sm/md），title 可选
 */
export default function SpeakButton({ word, text, accent = 'US', size = 'md', title }) {
  const { speaking, speak } = useSpeech();
  const content = text || word;
  const active = speaking === content;

  const sizeCls = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  const iconCls = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        speak(content, ACCENTS[accent] || 'en-US');
      }}
      title={title || (active ? '停止播放' : `播放发音（${accent}）`)}
      aria-label={title || `播放 ${content} 的${accent}发音`}
      className={`${sizeCls} inline-flex shrink-0 items-center justify-center rounded-full ring-1 transition ${
        active
          ? 'bg-brand-100 text-brand-700 ring-brand-300'
          : 'bg-brand-50 text-brand-600 ring-brand-100 hover:bg-brand-100'
      }`}
    >
      {active ? <VolumeX className={iconCls} /> : <Volume2 className={iconCls} />}
    </button>
  );
}
