import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';

const FEATURES = [
  { icon: '🎯', title: '考纲范围选择', desc: '四六级、高考、雅思托福、专四专八等 11 类考纲，按需学习' },
  { icon: '📷', title: '题目单词智能识别', desc: '拍照或导入题目图片，自动提取单词并按重要程度分类' },
  { icon: '🧠', title: '遗忘曲线复习', desc: '基于艾宾浩斯间隔重复，自动生成复习计划与提醒' },
  { icon: '📝', title: '生词本与标记', desc: '加入生词本、标记已掌握、收藏疑难词汇，随时回顾' },
  { icon: '✏️', title: '多样化测验', desc: '拼写（带发音）、词义匹配、听力辨词三类自测' },
  { icon: '📱', title: '多平台自适应', desc: '手机、平板、桌面全适配，支持 PWA 离线使用' }
];

export default function Home() {
  const { syllabusId, stats } = useApp();
  const [syllabi, setSyllabi] = useState([]);
  const [totalWords, setTotalWords] = useState(0);

  useEffect(() => {
    api
      .syllabi()
      .then((list) => {
        setSyllabi(list);
        setTotalWords(list.reduce((sum, s) => sum + (s.stats?.total || 0), 0));
      })
      .catch(() => {});
  }, []);

  const current = syllabi.find((s) => s.id === syllabusId);

  return (
    <div className="space-y-8">
      <section className="card overflow-hidden bg-gradient-to-br from-brand-600 via-indigo-600 to-violet-600 p-6 text-white md:p-10">
        <div className="max-w-2xl">
          <p className="mb-2 text-sm font-medium text-indigo-200">多平台自适应英语学习工具</p>
          <h1 className="text-2xl font-bold leading-tight md:text-4xl">
            拍一道题，识别单词，按考纲学起来
          </h1>
          <p className="mt-3 text-sm text-indigo-100 md:text-base">
            覆盖 11 类考试考纲词库，支持拍照识别题目中的单词，按高频 / 常考 / 重点分类学习，
            并用遗忘曲线科学复习。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/scan" className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow hover:bg-indigo-50">
              📷 拍照识别单词
            </Link>
            <Link to="/words" className="rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-white/25">
              开始背单词
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-2xl">📚</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalWords || '—'}</div>
          <div className="text-sm text-slate-500">词库总量（跨考纲统计）</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl">🗂️</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats?.total ?? '—'}</div>
          <div className="text-sm text-slate-500">生词本中的单词</div>
        </div>
        <Link to="/review" className="card p-5 transition hover:shadow-md">
          <div className="text-2xl">⏰</div>
          <div className={`mt-2 text-2xl font-bold ${stats?.dueToday > 0 ? 'text-red-500' : 'text-slate-900'}`}>
            {stats?.dueToday ?? '—'}
          </div>
          <div className="text-sm text-slate-500">
            {stats?.dueToday > 0 ? '今日到期复习，点击开始' : '今日暂无到期复习'}
          </div>
        </Link>
      </section>

      {current && (
        <section className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{current.icon}</span>
            <div>
              <div className="font-semibold text-slate-900">{current.name}</div>
              <div className="text-sm text-slate-500">
                当前考纲 · {current.stats.total} 词 · {current.stats.phrases} 词组
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/exams" className="btn-secondary">切换考纲</Link>
            <Link to="/words" className="btn-primary">学习 {current.name}</Link>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">核心功能</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5">
              <div className="text-2xl">{f.icon}</div>
              <div className="mt-2 font-semibold text-slate-900">{f.title}</div>
              <div className="mt-1 text-sm leading-relaxed text-slate-500">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
