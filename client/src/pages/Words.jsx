import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { api } from '../api';
import { useApp } from '../store';
import LevelBadge from '../components/LevelBadge';
import SpeakButton from '../components/SpeakButton';
import StatusButtons from '../components/StatusButtons';
import EmptyState from '../components/EmptyState';

const LEVELS = [
  ['', '全部'],
  ['high_frequency', '高频'],
  ['frequent', '常考'],
  ['key', '重点'],
  ['cognition', '认知']
];

const PAGE_SIZE = 50;

// 高频/重点词汇的视觉强调样式（手风琴条）
const ACCENT = {
  high_frequency: 'border-l-4 border-l-red-400 bg-gradient-to-r from-red-50/70 to-transparent',
  key: 'border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50/70 to-transparent',
  frequent: '',
  cognition: ''
};

export default function Words() {
  const { syllabusId } = useApp();
  const [syllabi, setSyllabi] = useState([]);
  const [data, setData] = useState({ total: 0, items: [] });
  const [level, setLevel] = useState('');
  const [q, setQ] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null); // 手风琴：同一时间只展开一条

  useEffect(() => {
    api.syllabi().then(setSyllabi).catch(() => {});
  }, []);

  const current = syllabi.find((s) => s.id === syllabusId);

  useEffect(() => {
    setLoading(true);
    setOpenId(null);
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
          <div className="space-y-2">
            {data.items.map((item) => {
              const open = openId === item.id;
              const emphasized = item.level === 'high_frequency' || item.level === 'key';
              return (
                <div
                  key={item.id}
                  className={`card overflow-hidden transition ${
                    emphasized ? ACCENT[item.level] : ''
                  } ${open ? 'shadow-md ring-1 ring-brand-300' : ''}`}
                >
                  {/* 手风琴头部：点击展开/收起；发音与标记按钮为兄弟节点，避免嵌套按钮 */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : item.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      aria-expanded={open}
                    >
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-base font-semibold text-slate-900">{item.word}</span>
                          <LevelBadge level={item.level} />
                          {emphasized && (
                            <span className="chip bg-red-50 text-red-600 ring-1 ring-red-200">重点掌握</span>
                          )}
                          {item.status && (
                            <span className="chip bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                              {item.status === 'new' ? '生词本' : item.status === 'mastered' ? '已掌握' : '收藏'}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-slate-500">
                          {item.phoneticUS || item.phoneticUK || ''} {item.pos}{' '}
                          {item.meanings.join('；')}
                        </span>
                      </span>
                    </button>
                    <SpeakButton word={item.word} accent="US" size="sm" />
                    <StatusButtons wordId={item.id} initialStatus={item.status} size="sm" />
                  </div>

                  {/* 手风琴内容：详细释义、例句、词组等 */}
                  {open && (
                    <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <div className="mb-1.5 text-xs font-semibold text-slate-400">释义</div>
                          <div className="space-y-1">
                            {item.meanings.map((m, i) => (
                              <div key={i} className="flex items-baseline gap-2 text-sm text-slate-700">
                                <span className="text-brand-500">▸</span>
                                <span>{m}</span>
                              </div>
                            ))}
                          </div>
                          {item.synonyms.length > 0 && (
                            <div className="mt-3">
                              <div className="mb-1.5 text-xs font-semibold text-slate-400">同义词</div>
                              <div className="flex flex-wrap gap-1.5">
                                {item.synonyms.map((s) => (
                                  <span key={s} className="chip bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          {item.examples.length > 0 && (
                            <div className="mb-3">
                              <div className="mb-1.5 text-xs font-semibold text-slate-400">例句</div>
                              {item.examples.map((ex, i) => (
                                <div key={i} className="mb-2 rounded-lg bg-white p-2.5 ring-1 ring-slate-100">
                                  <div className="text-sm text-slate-800">{ex.en}</div>
                                  <div className="mt-0.5 text-xs text-slate-500">{ex.zh}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {item.collocations.length > 0 && (
                            <div>
                              <div className="mb-1.5 text-xs font-semibold text-slate-400">常用搭配</div>
                              <div className="flex flex-wrap gap-1.5">
                                {item.collocations.map((c) => (
                                  <span key={c} className="chip bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <Link
                          to={`/words/${encodeURIComponent(item.id)}`}
                          className="text-sm font-medium text-brand-600 hover:underline"
                        >
                          查看完整解析（考点 / 真题 / 记忆技巧）→
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
