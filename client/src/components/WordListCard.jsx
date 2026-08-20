import React from 'react';
import { Link } from 'react-router-dom';
import LevelBadge from './LevelBadge';
import SpeakButton from './SpeakButton';

export default function WordListCard({ item }) {
  return (
    <Link
      to={`/words/${encodeURIComponent(item.id)}`}
      className="card flex items-center gap-3 px-4 py-3 hover:ring-brand-300 hover:shadow-md transition"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-base font-semibold text-slate-900">{item.word}</span>
          <LevelBadge level={item.level} />
          {item.status && (
            <span className="chip bg-brand-50 text-brand-600 ring-1 ring-brand-100">
              {item.status === 'new' ? '生词本' : item.status === 'mastered' ? '已掌握' : '收藏'}
            </span>
          )}
        </div>
        <div className="mt-0.5 truncate text-sm text-slate-500">
          {item.phoneticUS || item.phoneticUK || ''} {item.pos} {item.meanings.join('；')}
        </div>
      </div>
      <SpeakButton word={item.word} accent="US" />
      <span className="text-slate-300">›</span>
    </Link>
  );
}
