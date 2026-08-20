import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import EmptyState from '../components/EmptyState';

const BUTTONS = [
  { key: 'again', label: '忘记了', color: 'bg-red-500 hover:bg-red-600' },
  { key: 'good', label: '记得', color: 'bg-amber-500 hover:bg-amber-600' },
  { key: 'easy', label: '很轻松', color: 'bg-emerald-500 hover:bg-emerald-600' }
];

export default function Review() {
  const { refreshStats } = useApp();
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const resultRef = useRef({ counts: { again: 0, good: 0, easy: 0 } });

  useEffect(() => {
    api
      .reviewDue()
      .then((res) => {
        setItems(res.items);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const speak = useCallback((word) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }, []);

  const finish = useCallback(() => {
    setSummary(resultRef.current);
    refreshStats();
  }, [refreshStats]);

  const answer = async (result) => {
    const item = items[idx];
    resultRef.current.counts[result] += 1;
    try {
      await api.reviewComplete(item.wordId, result);
    } catch {
      /* 网络异常不阻塞流程 */
    }
    if (idx + 1 >= items.length) {
      finish();
    } else {
      setIdx(idx + 1);
      setRevealed(false);
    }
  };

  if (loading) return <div className="py-16 text-center text-slate-500">复习任务加载中…</div>;
  if (error) return <EmptyState icon="⚠️" title="加载失败" desc={error} />;
  if (summary)
    return (
      <EmptyState
        icon="🎉"
        title="今日复习完成"
        desc={`本次共复习 ${items.length} 词：忘记 ${summary.counts.again} · 记得 ${summary.counts.good} · 轻松 ${summary.counts.easy}`}
        action={
          <div className="mt-3 flex gap-2">
            <Link to="/quiz" className="btn-primary">去做测验</Link>
            <Link to="/wordbook" className="btn-secondary">返回生词本</Link>
          </div>
        }
      />
    );

  if (items.length === 0)
    return (
      <EmptyState
        icon="😌"
        title="暂无到期复习"
        desc="先添加一些生词，或稍后再来，系统会按遗忘曲线自动安排复习时间。"
        action={
          <Link to="/words" className="btn-primary mt-2">
            去学新单词
          </Link>
        }
      />
    );

  const item = items[idx];
  const progress = Math.round((idx / items.length) * 100);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>复习卡片</span>
        <span>
          {idx + 1} / {items.length}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="card p-8 text-center">
        <button
          onClick={() => speak(item.word.word)}
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-xl text-brand-600 ring-1 ring-brand-100 hover:bg-brand-100"
          title="播放发音"
        >
          🔊
        </button>
        <div className="text-4xl font-bold text-slate-900">{item.word.word}</div>
        {item.word.phoneticUS && (
          <div className="mt-1 text-sm text-slate-400">{item.word.phoneticUS}</div>
        )}

        {!revealed ? (
          <button onClick={() => setRevealed(true)} className="btn-secondary mt-6">
            显示释义
          </button>
        ) : (
          <div className="mt-6 space-y-3">
            <div className="rounded-xl bg-brand-50/70 p-4 text-slate-800">
              <span className="font-medium">{item.word.pos}</span>{' '}
              {item.word.meanings.join('；')}
            </div>
            {item.word.examples && item.word.examples[0] && (
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                {item.word.examples[0].en}
                <div className="mt-1 text-xs text-slate-400">{item.word.examples[0].zh}</div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {BUTTONS.map((b) => (
                <button key={b.key} onClick={() => answer(b.key)} className={`btn text-white ${b.color}`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
