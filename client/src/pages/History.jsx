import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkPlus,
  CheckSquare,
  ChevronDown,
  ClipboardCheck,
  History as HistoryIcon,
  Loader2,
  RotateCcw,
  ScanLine,
  Square,
  Trash2
} from 'lucide-react';
import { api } from '../api';
import LevelBadge, { LEVEL_LABELS } from '../components/LevelBadge';
import EmptyState from '../components/EmptyState';

const PAGE_SIZE = 20;

const TYPE_TABS = [
  ['', '全部'],
  ['recognition', '识别记录'],
  ['quiz', '测验记录'],
  ['wordbook', '生词本记录']
];

const TYPE_META = {
  recognition: { icon: ScanLine, color: 'text-brand-600', bg: 'bg-brand-50' },
  quiz: { icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  wordbook: { icon: BookmarkPlus, color: 'text-amber-600', bg: 'bg-amber-50' }
};

const QUESTION_TYPE_LABELS = {
  spelling: '拼写测验',
  meaning: '词义测验',
  listening: '听力测验'
};

const WORDBOOK_ACTION_LABELS = {
  add: '加入生词本',
  update: '更新标记',
  remove: '移出生词本'
};

function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function itemTitle(item) {
  if (item.type === 'recognition') {
    return `识别记录 · ${(item.syllabus || 'all').toUpperCase()} · 匹配 ${item.matchedCount} 词`;
  }
  if (item.type === 'quiz') {
    return `${QUESTION_TYPE_LABELS[item.questionType] || '测验'} · ${item.word || ''} ${
      item.correct ? '✓ 答对' : '✗ 答错'
    }`;
  }
  return `${WORDBOOK_ACTION_LABELS[item.action] || item.action} · ${item.word || ''}${
    item.status ? `（${item.status === 'new' ? '生词本' : item.status === 'mastered' ? '已掌握' : '收藏'}）` : ''
  }`;
}

export default function History() {
  const [type, setType] = useState('');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (nextOffset = 0, append = false) => {
      setLoading(true);
      setError('');
      try {
        const data = await api.history({ type, offset: nextOffset, limit: PAGE_SIZE });
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
        setTotal(data.total);
        setOffset(nextOffset);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [type]
  );

  useEffect(() => {
    setItems([]);
    setSelected(new Set());
    setExpandedId(null);
    setDetail(null);
    load(0, false);
  }, [type, load]);

  const toggleExpand = async (item) => {
    if (item.type !== 'recognition') return;
    if (expandedId === item.id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(item.id);
    setDetailLoading(true);
    try {
      setDetail(await api.historyItem(item.id));
    } catch (err) {
      setError(err.message);
      setExpandedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const removeOne = async (item) => {
    if (!confirm(`确定删除这条${TYPE_TABS.find((t) => t[0] === item.type)?.[1] || '历史'}吗？`)) return;
    try {
      await api.historyDelete(item.id);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      setTotal((t) => t - 1);
      if (expandedId === item.id) {
        setExpandedId(null);
        setDetail(null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const visibleIds = items.map((i) => i.id);
    setSelected((prev) => {
      const allSelected = visibleIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const invertSelect = () => {
    const visibleIds = new Set(items.map((i) => i.id));
    setSelected((prev) => {
      const next = new Set();
      for (const id of visibleIds) {
        if (!prev.has(id)) next.add(id);
      }
      return next;
    });
  };

  const removeSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`确定删除选中的 ${selected.size} 条记录吗？此操作不可恢复。`)) return;
    try {
      const res = await api.historyDeleteBatch([...selected]);
      setSelected(new Set());
      setExpandedId(null);
      setDetail(null);
      await load(0, false);
      if (res.removed < selected.size) {
        alert(`已删除 ${res.removed} 条，${selected.size - res.removed} 条可能已被清理。`);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const loadMore = () => load(offset + PAGE_SIZE, true);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 md:text-2xl">
            <HistoryIcon className="h-6 w-6 text-brand-600" />
            历史记录
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            识别、测验与生词本操作记录，按时间倒序排列，本地持久化保存。
          </p>
        </div>
        <button
          onClick={() => {
            setBatchMode((v) => !v);
            setSelected(new Set());
          }}
          className={batchMode ? 'btn-primary' : 'btn-secondary'}
        >
          {batchMode ? '退出批量操作' : '批量操作'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPE_TABS.map(([key, label]) => (
          <button
            key={key || 'all'}
            onClick={() => setType(key)}
            className={`chip ring-1 px-3.5 py-1.5 transition ${
              type === key ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-600 ring-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {batchMode && items.length > 0 && (
        <div className="card flex flex-wrap items-center gap-3 px-4 py-3">
          <button onClick={toggleSelectAll} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-600">
            {items.every((i) => selected.has(i.id)) ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            全选
          </button>
          <button onClick={invertSelect} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-600">
            <RotateCcw className="h-4 w-4" />
            反选
          </button>
          <span className="text-xs text-slate-400">已选 {selected.size} 条</span>
          <button
            onClick={removeSelected}
            disabled={selected.size === 0}
            className="ml-auto flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            删除选中（{selected.size}）
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {items.length === 0 && !loading ? (
        <EmptyState
          icon="🕘"
          title="暂无历史记录"
          desc="去识别题目、做测验或加入生词本，操作记录会显示在这里。"
          action={
            <div className="mt-2 flex gap-2">
              <Link to="/scan" className="btn-primary">去识别</Link>
              <Link to="/quiz" className="btn-secondary">去测验</Link>
            </div>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => {
            const meta = TYPE_META[item.type] || TYPE_META.recognition;
            const Icon = meta.icon;
            const expanded = expandedId === item.id;
            return (
              <div key={item.id} className="card overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  {batchMode && (
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className="shrink-0 text-slate-400 hover:text-brand-600"
                      title="选择/取消"
                    >
                      {selected.has(item.id) ? (
                        <CheckSquare className="h-5 w-5 text-brand-600" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  )}
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800">
                      {itemTitle(item)}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {fmtTime(item.createdAt)}
                      {item.type === 'recognition' && item.engine === 'demo' && ' · 演示文本'}
                    </div>
                    {item.type === 'recognition' && item.matchedWords.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.matchedWords.slice(0, 8).map((w) => (
                          <span key={w} className="chip bg-slate-100 text-slate-600">{w}</span>
                        ))}
                        {item.matchedWords.length > 8 && (
                          <span className="chip bg-slate-100 text-slate-400">+{item.matchedWords.length - 8}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {item.type === 'recognition' && (
                      <button
                        onClick={() => toggleExpand(item)}
                        className="btn-ghost text-xs"
                        title="查看识别结果"
                      >
                        {expanded ? '收起' : '查看'}
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                    <button
                      onClick={() => removeOne(item)}
                      className="btn-ghost text-red-500 hover:bg-red-50"
                      title="删除该条记录"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                    {detailLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin" /> 正在加载识别结果…
                      </div>
                    ) : detail ? (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-white p-3">
                          <div className="mb-1 text-xs font-medium text-slate-400">识别原文</div>
                          <p className="whitespace-pre-wrap text-sm text-slate-600">{detail.rawText}</p>
                        </div>
                        {detail.orderedGroups
                          .filter((g) => g.words.length > 0)
                          .map((g) => (
                            <div key={g.level} className="rounded-lg bg-white p-3">
                              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <LevelBadge level={g.level} />
                                {LEVEL_LABELS[g.level]}（{g.words.length}）
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {g.words.map((w) => (
                                  <Link
                                    key={w.id}
                                    to={`/words/${encodeURIComponent(w.id)}`}
                                    className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
                                  >
                                    {w.word}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && offset + items.length < total && (
        <div className="flex justify-center pt-1">
          <button onClick={loadMore} disabled={loading} className="btn-secondary">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            加载更多（{items.length}/{total}）
          </button>
        </div>
      )}
    </div>
  );
}
