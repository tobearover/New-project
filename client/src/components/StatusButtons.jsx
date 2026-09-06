import React, { useState } from 'react';
import { BookmarkPlus, CheckCircle2, Star } from 'lucide-react';
import { api } from '../api';
import { useApp } from '../store';

const STATUS_ITEMS = [
  { key: 'new', label: '生词本', Icon: BookmarkPlus },
  { key: 'mastered', label: '已掌握', Icon: CheckCircle2 },
  { key: 'favorite', label: '收藏', Icon: Star }
];

export default function StatusButtons({
  wordId,
  initialStatus = null,
  size = 'md',
  onChange,
  primaryOnlyOnMobile = false
}) {
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
    <div
      className={`flex gap-2 ${
        primaryOnlyOnMobile
          ? 'flex-wrap items-center'
          : size === 'sm'
            ? 'flex-col'
            : 'flex-wrap'
      }`}
    >
      {STATUS_ITEMS.map(({ key, label, Icon }) => {
        const active = status === key;
        return (
          <button
            key={key}
            type="button"
            disabled={busy}
            onClick={() => toggle(key)}
            className={`chip ring-1 transition ${
              primaryOnlyOnMobile && key !== 'new' ? 'hidden sm:inline-flex' : ''
            } ${
              active
                ? key === 'new'
                  ? 'bg-brand-600 text-white ring-brand-600'
                  : key === 'mastered'
                    ? 'bg-emerald-600 text-white ring-emerald-600'
                    : 'bg-amber-500 text-white ring-amber-500'
                : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
