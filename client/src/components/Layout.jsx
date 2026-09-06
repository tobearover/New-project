import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { BookOpen, Brain, Clock, FolderOpen, Home, LogOut, ScanLine } from 'lucide-react';
import { useApp, useAuth } from '../store';

// 底部导航（移动端）：5 项，历史入口移至生词本页
const MOBILE_NAV = [
  { to: '/', label: '首页', Icon: Home, end: true },
  { to: '/words', label: '单词', Icon: BookOpen },
  { to: '/scan', label: '识别', Icon: ScanLine },
  { to: '/wordbook', label: '生词本', Icon: FolderOpen },
  { to: '/quiz', label: '测验', Icon: Brain }
];

// 桌面导航：保留完整入口（含历史）
const DESKTOP_NAV = [
  ...MOBILE_NAV,
  { to: '/history', label: '历史', Icon: Clock }
];

function DesktopNav() {
  const { syllabusId, stats } = useApp();
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-30 hidden border-b border-slate-200 bg-white/90 backdrop-blur md:block">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-5 px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-brand-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-400 text-sm font-bold text-white">
            SV
          </span>
          SmartVocab
        </Link>
        <nav className="flex flex-1 items-center gap-1">
          {DESKTOP_NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-flex min-h-9 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/exams"
          className="chip bg-slate-100 px-4 py-2 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
        >
          考纲：{syllabusId.toUpperCase()}
        </Link>
        <Link
          to="/wordbook"
          aria-label="生词本"
          className="relative inline-flex items-center rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <FolderOpen className="h-5 w-5" />
          {stats && stats.dueToday > 0 && (
            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
              {stats.dueToday}
            </span>
          )}
        </Link>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100">{user.username}</span>
            <button
              onClick={logout}
              aria-label="退出登录"
              className="inline-flex min-h-9 items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <LogOut className="h-4 w-4" />
              退出
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary px-4 py-2 text-sm">
            登录 / 注册
          </Link>
        )}
      </div>
    </header>
  );
}

function MobileHeader() {
  const { syllabusId } = useApp();
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-slate-200 bg-white/90 px-3 py-3 backdrop-blur md:hidden">
      <Link to="/" className="flex min-w-0 items-center gap-2 font-bold text-brand-700">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-400 text-xs font-bold text-white">
          SV
        </span>
        <span className="truncate text-sm">SmartVocab</span>
      </Link>
      <div className="flex items-center gap-2">
        <Link
          to="/exams"
          className="chip bg-slate-100 px-3 py-2 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
          aria-label="切换考纲"
        >
          {syllabusId.toUpperCase()}
        </Link>
        {user ? (
          <button
            onClick={logout}
            aria-label="退出登录"
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <LogOut className="h-4 w-4" />
            退出
          </button>
        ) : (
          <Link to="/login" className="btn-primary px-3 py-2 text-xs">
            登录
          </Link>
        )}
      </div>
    </header>
  );
}

function MobileNav() {
  const { stats } = useApp();
  const location = useLocation();
  if (location.pathname.startsWith('/words/')) return null; // 详情页不显示底部栏，避免遮挡
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {MOBILE_NAV.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-xs focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
                isActive ? 'font-semibold text-brand-600' : 'text-slate-500'
              }`
            }
          >
            <span className="relative">
              <Icon className="h-5 w-5" />
              {to === '/wordbook' && stats && stats.dueToday > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {stats.dueToday}
                </span>
              )}
            </span>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <DesktopNav />
      <MobileHeader />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-5 md:px-6 md:pb-12">{children}</main>
      <MobileNav />
    </div>
  );
}
