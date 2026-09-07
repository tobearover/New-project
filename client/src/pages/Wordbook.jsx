import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BookmarkPlus,
  CalendarClock,
  CheckCircle2,
  Clock,
  FolderOpen,
  Library,
  Star
} from 'lucide-react';
import { api } from '../api';
import { useApp } from '../store';
import StatusButtons from '../components/StatusButtons';
import EmptyState from '../components/EmptyState';

const TABS = [
  ['', '全部'],
  ['new', '生词本'],
  ['favorite', '收藏'],
  ['mastered', '已掌握']
];

/** 防御性释义：meanings 缺失/空数组时给出占位，保证卡片不错位 */
function meaningText(item) {
  const list =
    item && item.word && Array.isArray(item.word.meanings) ? item.word.meanings.filter(Boolean) : [];
  return list.length > 0 ? list.join('；') : '暂无释义';
}

export default function Wordbook() {
  const { stats, refreshStats, refreshWordbookStatus } = useApp();
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 md:text-2xl">个性化生词本</h1>
          <p className="mt-0.5 text-sm text-slate-500">标记生词、掌握状态与收藏，基于遗忘曲线安排复习。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/history"
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <Clock className="h-4 w-4" />
            学习历史
          </Link>
          <Link to="/review" className="btn-primary">
            <CalendarClock className="h-4 w-4" />
            开始复习（{stats?.dueToday ?? 0}）
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['total', '全部单词', Library],
          ['new', '生词本', BookmarkPlus],
          ['mastered', '已掌握', CheckCircle2],
          ['favorite', '收藏', Star]
        ].map(([key, label, Icon]) => (
          <div key={key} className="card p-5">
            <Icon className="h-5 w-5 text-brand-500" />
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
            className={`chip ring-1 px-4 py-1.5 transition ${
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
        <EmptyState icon={AlertTriangle} title="加载失败" desc={error} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={tab === 'favorite' ? '还没有收藏的单词' : tab === 'mastered' ? '还没有已掌握的单词' : '生词本还是空的'}
          desc={
            tab === 'favorite'
              ? '浏览单词时点击「收藏」，重要单词会集中在这里。'
              : tab === 'mastered'
                ? '掌握一个单词后标记「已掌握」，这里会汇总你的成果。'
                : '在单词详情或识别结果中点击「生词本」开始积累。'
          }
          action={
            <Link to="/words" className="btn-primary mt-2">
              去学习单词
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map(
            (item) =>
              item.word && (
                <div
                  key={item.wordId}
                  className="card flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/words/${encodeURIComponent(item.word.id)}`}
                      className="text-base font-bold text-slate-900 hover:text-brand-600"
                    >
                      {item.word.word}
                    </Link>
                    <div className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {meaningText(item)}
                    </div>
                  </div>
                  <StatusButtons
                    wordId={item.word.id}
                    initialStatus={item.status}
                    onChange={() => {
                      load(tab);
                      refreshStats();
                      refreshWordbookStatus();
                    }}
                  />
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
