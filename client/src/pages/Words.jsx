import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import WordListCard from '../components/WordListCard';
import EmptyState from '../components/EmptyState';

const LEVELS = [
  ['', '全部'],
  ['high_frequency', '高频'],
  ['frequent', '常考'],
  ['key', '重点'],
  ['cognition', '认知']
];

const PAGE_SIZE = 50;

export default function Words() {
  const { syllabusId } = useApp();
  const [syllabi, setSyllabi] = useState([]);
  const [data, setData] = useState({ total: 0, items: [] });
  const [level, setLevel] = useState('');
  const [q, setQ] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.syllabi().then(setSyllabi).catch(() => {});
  }, []);

  const current = syllabi.find((s) => s.id === syllabusId);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .words({ syllabus: syllabusId, level, q, limit: PAGE_SIZE, offset })
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [syllabusId, level, q, offset]);

  const levelCounts = useMemo(() => {
    const stats = current?.stats?.levels || {};
    return stats;
  }, [current]);

  const resetPage = (fn) => {
    setOffset(0);
    fn();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
            {current ? `${current.icon} ${current.name}` : '单词学习'}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {current ? `${current.versions[0].year} · 共 ${data.total} 词` : '请先选择考纲'}
          </p>
        </div>
        <Link to="/exams" className="btn-secondary">
          切换考纲
        </Link>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          className="input md:max-w-xs"
          placeholder="搜索单词（如 abandon）"
          value={q}
          onChange={(e) => resetPage(() => setQ(e.target.value))}
        />
        <div className="flex flex-wrap gap-1.5">
          {LEVELS.map(([key, label]) => (
            <button
              key={key || 'all'}
              onClick={() => resetPage(() => setLevel(key))}
              className={`chip ring-1 px-3 py-1.5 transition ${
                level === key
                  ? 'bg-brand-600 text-white ring-brand-600'
                  : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50'
              }`}
            >
              {label}
              {key && levelCounts[key] != null ? ` ${levelCounts[key]}` : ''}
            </button>
          ))}
        </div>
      </div>

      {loading && offset === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card h-[74px] animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon="📖"
          title="没有找到单词"
          desc={q ? `没有匹配「${q}」的单词，试试其他关键词。` : '该考纲词库暂无单词。'}
        />
      ) : (
        <>
          <div className="space-y-2.5">
            {data.items.map((item) => (
              <WordListCard key={item.id} item={item} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              className="btn-secondary"
              disabled={offset === 0}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            >
              ← 上一页
            </button>
            <span className="text-sm text-slate-500">
              {data.total === 0 ? 0 : offset + 1} - {Math.min(offset + PAGE_SIZE, data.total)} / {data.total}
            </span>
            <button
              className="btn-secondary"
              disabled={offset + PAGE_SIZE >= data.total}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
            >
              下一页 →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
