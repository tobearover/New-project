import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BookOpen, ChevronRight, SearchX } from 'lucide-react';
import { api } from '../api';
import { useApp } from '../store';
import LevelBadge from '../components/LevelBadge';
import SpeakButton from '../components/SpeakButton';
import EmptyState from '../components/EmptyState';
import { WordCardSkeleton } from '../components/Skeleton';

const LEVELS = [
  ['', '全部'],
  ['high_frequency', '高频'],
  ['frequent', '常考'],
  ['key', '重点'],
  ['cognition', '认知']
];

const PAGE_SIZE = 50;

// 卡片顶部色带：高频红 / 重点蓝，方便快速扫读
const ACCENT_BAR = {
  high_frequency: 'bg-red-400',
  frequent: 'bg-orange-300',
  key: 'bg-blue-400',
  cognition: 'bg-slate-200'
};

const STATUS_LABEL = {
  new: '生词本',
  mastered: '已掌握',
  favorite: '收藏'
};

function Meanings({ meanings }) {
  const list = Array.isArray(meanings) ? meanings : [];
  const shown = list.slice(0, 4);
  const rest = list.length - shown.length;
  return (
    <>
      {shown.map((m, i) => (
        <span key={i} className="block text-sm leading-relaxed text-slate-700">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-400 align-middle" />
          {m}
        </span>
      ))}
      {rest > 0 && (
        <span className="text-sm text-slate-400">还有 {rest} 个释义，点击查看完整解析</span>
      )}
    </>
  );
}

export default function Words() {
  const { syllabusId } = useApp();
  const [syllabi, setSyllabi] = useState([]);
  const [data, setData] = useState({ total: 0, items: [] });
  const [level, setLevel] = useState('');
  const [q, setQ] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    api.syllabi().then(setSyllabi).catch(() => {});
  }, []);

  const current = syllabi.find((s) => s.id === syllabusId);

  useEffect(() => {
    setLoading(true);
    setError('');
    const timer = setTimeout(() => {
      api
        .words({ syllabus: syllabusId, level, q, limit: PAGE_SIZE, offset })
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || '加载失败');
          setLoading(false);
        });
    }, 200);
    return () => clearTimeout(timer);
  }, [syllabusId, level, q, offset, tick]);

  const levelCounts = useMemo(() => current?.stats?.levels || {}, [current]);

  const resetPage = (fn) => {
    setOffset(0);
    fn();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
            <BookOpen className="mr-2 inline h-5 w-5 text-brand-600" />
            {current ? current.name : '单词学习'}
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
        <div className="flex flex-wrap gap-2">
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
      <p className="text-sm text-slate-500" aria-live="polite">
        {loading ? '正在查找…' : `找到 ${data.total} 个单词`}
      </p>

      {error ? (
        <EmptyState
          icon={AlertTriangle}
          title="加载失败"
          desc={error}
          action={{ label: '重试', onClick: () => setTick((t) => t + 1) }}
        />
      ) : loading && offset === 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <WordCardSkeleton key={i} />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={q ? SearchX : BookOpen}
          title={q ? '未找到匹配的单词' : '没有找到单词'}
          desc={q ? `没有匹配「${q}」的单词，试试其他关键词。` : '该考纲词库暂无单词。'}
          action={q ? { label: '清除搜索', onClick: () => resetPage(() => setQ('')) } : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => (
              <Link
                key={item.id}
                to={`/words/${encodeURIComponent(item.id)}`}
                className="card card-interactive group flex flex-col overflow-hidden p-5"
              >
                <span className={`h-1 w-full ${ACCENT_BAR[item.level] || ACCENT_BAR.cognition}`} />
                <div className="flex flex-1 flex-col pt-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-xl font-bold text-slate-900">{item.word}</span>
                        <LevelBadge level={item.level} />
                        {item.status && STATUS_LABEL[item.status] && (
                          <span className="chip bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                            {STATUS_LABEL[item.status]}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
                        {item.phoneticUS && <span className="text-slate-400">美 {item.phoneticUS}</span>}
                        {item.phoneticUK && <span className="text-slate-400">英 {item.phoneticUK}</span>}
                        <span className="font-medium text-slate-600">{item.pos}</span>
                      </div>
                    </div>
                    <SpeakButton word={item.word} accent="US" size="sm" />
                  </div>

                  <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
                    <Meanings meanings={item.meanings} />
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-medium text-brand-600">
                    <span>查看完整解析</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
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
