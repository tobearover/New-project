import React, { useState } from 'react';
import { api } from '../api';
import { useApp } from '../store';

const STATUS_ITEMS = [
  { key: 'new', label: '生词本', icon: '📝' },
  { key: 'mastered', label: '已掌握', icon: '✅' },
  { key: 'favorite', label: '收藏', icon: '⭐' }
];

export default function StatusButtons({ wordId, initialStatus = null, size = 'md', onChange }) {
  const { refreshStats } = useApp();
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);

  const toggle = async (key) => {
    if (busy) return;
    setBusy(true);
    try {
      const next = status === key ? null : key;
      if (next) {
        const isNewEntry = !status;
        if (isNewEntry) await api.wordbookAdd(wordId, next);
        else await api.wordbookUpdate(wordId, next);
      } else {
        await api.wordbookRemove(wordId);
      }
      setStatus(next);
      refreshStats();
      if (onChange) onChange(next);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex gap-1.5 ${size === 'sm' ? 'flex-col' : 'flex-wrap'}`}>
      {STATUS_ITEMS.map((item) => {
        const active = status === item.key;
        return (
          <button
            key={item.key}
            type="button"
            disabled={busy}
            onClick={() => toggle(item.key)}
            className={`chip ring-1 transition ${
              active
                ? item.key === 'new'
                  ? 'bg-brand-600 text-white ring-brand-600'
                  : item.key === 'mastered'
                    ? 'bg-emerald-600 text-white ring-emerald-600'
                    : 'bg-amber-500 text-white ring-amber-500'
                : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50'
            }`}
          >
            {item.icon} {item.label}
            {active ? ' ✓' : ''}
          </button>
        );
      })}
    </div>
  );
}
