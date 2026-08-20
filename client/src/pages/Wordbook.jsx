import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import LevelBadge from '../components/LevelBadge';
import SpeakButton from '../components/SpeakButton';
import StatusButtons from '../components/StatusButtons';
import EmptyState from '../components/EmptyState';

const TABS = [
  ['', '全部'],
  ['new', '生词本'],
  ['favorite', '收藏'],
  ['mastered', '已掌握']
];

export default function Wordbook() {
  const { stats, refreshStats } = useApp();
  const [tab, setTab] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(
    (status) => {
      setLoading(true);
      api
        .wordbook(status ? { status } : {})
        .then((res) => {
          setItems(res.items);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    },
    []
  );

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  const remove = async (wordId) => {
    if (!confirm('确定将该单词移出生词本吗？')) return;
    await api.wordbookRemove(wordId);
    refreshStats();
    load(tab);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 md:text-2xl">个性化生词本</h1>
          <p className="mt-0.5 text-sm text-slate-500">标记生词、掌握状态与收藏，基于遗忘曲线安排复习。</p>
        </div>
        <Link to="/review" className="btn-primary">
          ⏰ 开始复习（{stats?.dueToday ?? 0}）
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['total', '全部单词', '🗂️'],
          ['new', '生词本', '📝'],
          ['mastered', '已掌握', '✅'],
          ['favorite', '收藏', '⭐']
        ].map(([key, label, icon]) => (
          <div key={key} className="card p-4">
            <div className="text-xl">{icon}</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{stats?.[key] ?? '—'}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(([key, label]) => (
          <button
            key={key || 'all'}
            onClick={() => setTab(key)}
            className={`chip ring-1 px-3.5 py-1.5 transition ${
              tab === key ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-600 ring-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card h-[88px] animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon="⚠️" title="加载失败" desc={error} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="🗂️"
          title="还没有单词"
          desc="在单词详情或识别结果中点击「加入生词本」开始积累，也可以直接去学习单词。"
          action={
            <Link to="/words" className="btn-primary mt-2">
              去背单词
            </Link>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.wordId} className="card flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/words/${encodeURIComponent(item.word.id)}`} className="font-semibold text-slate-900 hover:text-brand-600">
                    {item.word.word}
                  </Link>
                  <LevelBadge level={item.word.level} />
                  {item.due && (
                    <Link to="/review" className="chip bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100">
                      ⏰ 今日到期
                    </Link>
                  )}
                  <span className="chip bg-slate-100 text-slate-500 ring-1 ring-slate-200">
                    已复习 {item.reviewCount} 次
                  </span>
                </div>
                <div className="mt-0.5 truncate text-sm text-slate-500">
                  {item.word.phoneticUS || ''} {item.word.pos} {item.word.meanings.join('；')}
                </div>
                {item.nextReview && (
                  <div className="mt-0.5 text-xs text-slate-400">下次复习：{item.nextReview}</div>
                )}
              </div>
              <SpeakButton word={item.word.word} accent="US" size="sm" />
              <StatusButtons wordId={item.word.id} initialStatus={item.status} onChange={() => load(tab)} />
              <button onClick={() => remove(item.word.id)} className="btn-ghost text-red-500 hover:bg-red-50" title="移除">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
