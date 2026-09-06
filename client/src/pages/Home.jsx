import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Bookmark, CalendarClock, Camera, ChevronRight, Library } from 'lucide-react';
import { api } from '../api';
import { useApp, useAuth } from '../store';
import { Skeleton } from '../components/Skeleton';

function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function initialOf(name) {
  return String(name || '?').trim().charAt(0).toUpperCase() || '?';
}

export default function Home() {
  const { syllabusId, stats, refreshStats } = useApp();
  const { user } = useAuth();
  const [syllabi, setSyllabi] = useState([]);
  const [totalWords, setTotalWords] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api
      .syllabi()
      .then(setSyllabi)
      .catch(() => {});
  }, []);

  // 词库总量：运行词库唯一词数（/api/health），避免跨考纲重复统计
  useEffect(() => {
    api
      .health()
      .then((h) => setTotalWords(h.stats && h.stats.words))
      .catch(() => {});
  }, []);

  // 登录状态变化时刷新生词本/复习统计
  useEffect(() => {
    if (user) refreshStats();
  }, [user, refreshStats]);

  // 最近 3 条识别记录（需登录，按账号隔离）
  useEffect(() => {
    if (!user) {
      setRecent([]);
      return;
    }
    let cancelled = false;
    api
      .recognitionHistory(3)
      .then((h) => {
        if (!cancelled) setRecent(h.items || []);
      })
      .catch(() => {
        if (!cancelled) setRecent([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const current = syllabi.find((s) => s.id === syllabusId);
  const dueToday = stats ? stats.dueToday : null;

  return (
    <div className="space-y-5">
      {/* 顶部：用户 + 当前考纲 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 text-base font-bold text-white">
            {user ? initialOf(user.username) : '客'}
          </span>
          <div className="min-w-0">
            <div className="truncate text-base font-bold text-slate-900">
              {user ? `你好，${user.username}` : '你好，访客'}
            </div>
            <div className="truncate text-xs text-slate-500">
              已收录 {totalWords ?? '…'} 词 · 覆盖 {syllabi.length || '…'} 类考纲
            </div>
          </div>
        </div>
        <Link
          to="/exams"
          className="chip max-w-full truncate bg-brand-50 py-1.5 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
          title="切换考纲"
        >
          当前考纲：{current ? current.name : syllabusId.toUpperCase()}
          <ChevronRight className="ml-1 inline h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 三个核心数据卡片 */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="card flex items-center gap-3 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Library className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="text-xl font-bold text-slate-900">
              {totalWords === null ? <Skeleton className="h-6 w-14" /> : totalWords}
            </div>
            <div className="text-xs text-slate-500">词库总量</div>
          </div>
        </div>

        <Link to="/wordbook" className="card card-interactive flex items-center gap-3 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Bookmark className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="text-xl font-bold text-slate-900">
              {stats ? stats.total : user ? <Skeleton className="h-6 w-10" /> : '—'}
            </div>
            <div className="truncate text-xs text-slate-500">生词本</div>
          </div>
        </Link>

        <Link to="/review" className="card card-interactive flex items-center gap-3 p-5">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              dueToday > 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <CalendarClock className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className={`text-xl font-bold ${dueToday > 0 ? 'text-red-500' : 'text-slate-900'}`}>
              {dueToday === null ? (user ? <Skeleton className="h-6 w-10" /> : '—') : dueToday}
            </div>
            <div className="truncate text-xs text-slate-500">
              {dueToday === null
                ? '今日复习'
                : dueToday > 0
                  ? '今日到期，点击复习'
                  : '今日暂无到期复习'}
            </div>
          </div>
        </Link>
      </section>

      {/* 两个核心操作 */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/scan"
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 px-5 py-5 text-base font-bold text-white shadow-sm transition hover:opacity-95"
        >
          <Camera className="h-5 w-5" />
          拍照识别单词
        </Link>
        <Link
          to="/words"
          className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-5 text-base font-bold text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-50"
        >
          <BookOpen className="h-5 w-5" />
          浏览单词
        </Link>
      </section>

      {/* 最近识别 */}
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3">
          <span className="text-sm font-semibold text-slate-800">最近识别</span>
          <Link to="/history" className="text-xs text-brand-600 hover:underline">
            全部历史
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <p className="text-sm text-slate-400">
              {user ? '暂无识别记录' : '登录后查看最近识别记录'}
            </p>
            <Link to="/scan" className="text-xs font-medium text-brand-600 hover:underline">
              去识别题目
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((item) => (
              <Link
                key={item.id}
                to="/scan"
                state={{ openRecognitionId: item.id }}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-brand-50/40"
              >
                <span className="chip bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                  {(item.syllabus || 'all').toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs text-slate-500">{fmtTime(item.createdAt)}</div>
                  <div className="truncate text-sm font-medium text-slate-700">
                    匹配 {item.matchedCount} 词
                    {item.matchedWords.length > 0 && (
                      <span className="ml-1 font-normal text-slate-400">
                        · {item.matchedWords.slice(0, 3).join('、')}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
