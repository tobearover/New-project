import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['全部', '国内考试', '出国考试', '专业考试'];
const LEVEL_ORDER = [
  ['high_frequency', '高频'],
  ['frequent', '常考'],
  ['key', '重点'],
  ['cognition', '认知']
];

export default function Exams() {
  const { syllabusId, selectSyllabus } = useApp();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [category, setCategory] = useState('全部');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .syllabi()
      .then((data) => {
        setList(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(
    () => (category === '全部' ? list : list.filter((s) => s.category === category)),
    [list, category]
  );

  const choose = (s) => {
    selectSyllabus(s.id);
    navigate('/words');
  };

  if (loading) return <div className="py-16 text-center text-slate-500">考纲加载中…</div>;
  if (error)
    return (
      <EmptyState
        icon="⚠️"
        title="加载失败"
        desc={error}
        action={<span className="text-xs text-slate-400">请确认后端服务已启动（npm run dev:server）</span>}
      />
    );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 md:text-2xl">选择考纲范围</h1>
        <p className="mt-1 text-sm text-slate-500">选择目标考试后，学习、识别与测验都将基于该考纲词库。</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`chip ring-1 px-3.5 py-1.5 transition ${
              category === c
                ? 'bg-brand-600 text-white ring-brand-600'
                : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((s) => {
          const active = s.id === syllabusId;
          return (
            <div
              key={s.id}
              className={`card flex flex-col gap-4 p-5 ${active ? 'ring-2 ring-brand-500' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-2xl">
                  {s.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-slate-900">{s.name}</h2>
                    {active && <span className="chip bg-brand-600 text-white">当前考纲</span>}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">
                    {s.category} · {s.versions.map((v) => v.year).join(' / ')}
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-600">{s.description}</p>
              <p className="text-xs text-slate-400">
                <span className="font-medium text-slate-500">适用人群：</span>
                {s.audience}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {LEVEL_ORDER.map(([key, label]) => (
                  <span key={key} className="chip bg-slate-100 text-slate-600">
                    {label} {s.stats?.levels?.[key] || 0}
                  </span>
                ))}
                <span className="chip bg-violet-50 text-violet-700">词组 {s.stats?.phrases || 0}</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="text-xs text-slate-400">
                  共 <span className="font-bold text-brand-600">{s.stats?.total || 0}</span> 词
                </div>
                <button onClick={() => choose(s)} className="btn-primary">
                  {active ? '重新选择' : '选择此考纲'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
