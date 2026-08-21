import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useApp } from '../store';

const NAV = [
  { to: '/', label: '首页', icon: '🏠', end: true },
  { to: '/words', label: '单词', icon: '📖' },
  { to: '/scan', label: '识别', icon: '📷' },
  { to: '/wordbook', label: '生词本', icon: '🗂️' },
  { to: '/quiz', label: '测验', icon: '✏️' },
  { to: '/history', label: '历史', icon: '🕘' }
];

function DesktopNav() {
  const { syllabusId, stats } = useApp();
  return (
    <header className="sticky top-0 z-30 hidden border-b border-slate-200 bg-white/90 backdrop-blur md:block">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-brand-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-400 text-sm text-white">
            SV
          </span>
          SmartVocab
        </Link>
        <nav className="flex flex-1 items-center gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/exams" className="chip bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200">
          考纲：{syllabusId.toUpperCase()}
        </Link>
        <Link to="/wordbook" className="relative flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100">
          🗂️
          {stats && stats.dueToday > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {stats.dueToday}
            </span>
          )}
        </Link>
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
      <div className="grid grid-cols-6">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 py-2 text-[11px] ${
                isActive ? 'text-brand-600 font-semibold' : 'text-slate-500'
              }`
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
            {item.to === '/wordbook' && stats && stats.dueToday > 0 && (
              <span className="absolute right-1/2 top-1 flex h-4 min-w-4 translate-x-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {stats.dueToday}
              </span>
            )}
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
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-5 md:px-6 md:pb-12">{children}</main>
      <MobileNav />
    </div>
  );
}
