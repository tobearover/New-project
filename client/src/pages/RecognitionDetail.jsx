import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, ChevronRight, FileText, ScanLine } from 'lucide-react';
import { api } from '../api';
import EmptyState from '../components/EmptyState';
import LevelBadge, { LEVEL_LABELS } from '../components/LevelBadge';

const ACCENT_BAR = {
  high_frequency: 'bg-red-400',
  frequent: 'bg-orange-300',
  key: 'bg-blue-400',
  cognition: 'bg-slate-200'
};

function fmtFullTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function engineLabel(engine) {
  return engine === 'aliyun' ? '阿里云OCR' : engine === 'demo' ? '文本输入' : engine || 'OCR';
}

function MetaItem({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

export default function RecognitionDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .recognitionHistoryItem(id)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || '识别记录不存在或已被删除');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading)
    return (
      <div className="space-y-3">
        <div className="card h-40 animate-pulse bg-slate-100" />
        <div className="card h-24 animate-pulse bg-slate-100" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card h-28 animate-pulse bg-slate-100" />
          <div className="card h-28 animate-pulse bg-slate-100" />
        </div>
      </div>
    );

  if (error)
    return (
      <EmptyState
        icon={AlertTriangle}
        title="无法查看该识别记录"
        desc={error}
        action={
          <Link to="/history" className="btn-primary">
            返回历史记录
          </Link>
        }
      />
    );

  if (!data) return null;

  const syllabusName = data.syllabus ? data.syllabus.toUpperCase() : '全部考纲';
  const groups = (data.orderedGroups || []).filter((g) => g.words.length > 0);

  return (
    <div className="space-y-4">
      <Link
        to="/history"
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        返回历史记录
      </Link>

      {/* 记录概览 */}
      <section className="card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3">
          <ScanLine className="h-5 w-5 shrink-0 text-brand-600" />
          <h1 className="text-base font-bold text-slate-900 md:text-lg">识别结果详情</h1>
          {data.fromSnapshot && (
            <span className="chip bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">结果快照</span>
          )}
        </div>
        <div className="grid gap-x-6 px-4 py-2 sm:grid-cols-2">
          <MetaItem label="识别时间" value={fmtFullTime(data.recognizedAt || data.createdAt)} />
          <MetaItem label="OCR 引擎" value={engineLabel(data.engine)} />
          <MetaItem label="匹配考纲" value={syllabusName} />
          <MetaItem
            label="匹配结果"
            value={`${data.stats?.matchedWords ?? data.matchedCount ?? 0} 词 · ${data.stats?.matchedPhrases ?? data.phraseCount ?? 0} 词组`}
          />
        </div>
      </section>

      {/* 原题图片（如有） */}
      {data.imageUrl && (
        <section className="card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
            <FileText className="h-4 w-4 text-brand-600" />
            原题图片
          </h2>
          <img
            src={data.imageUrl}
            alt="识别原题图片"
            className="max-h-80 w-auto max-w-full rounded-xl border border-slate-200 object-contain"
          />
        </section>
      )}

      {/* 识别原文 */}
      {data.rawText && (
        <section className="card p-4">
          <h2 className="mb-2 text-sm font-bold text-slate-800">识别原文</h2>
          <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
            {data.rawText}
          </p>
        </section>
      )}

      {/* 完整单词列表（按词类分组，带高亮标记） */}
      {groups.length === 0 ? (
        <EmptyState
          icon={ScanLine}
          title="未匹配到考纲内单词"
          desc="识别内容中的单词可能未收录或不在所选考纲内。"
        />
      ) : (
        groups.map((group) => (
          <section key={group.level} className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <LevelBadge level={group.level} />
                {LEVEL_LABELS[group.level]} · {group.words.length} 个
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {group.words.map((w) => (
                <Link
                  key={w.id}
                  to={`/words/${encodeURIComponent(w.id)}`}
                  className="group flex items-center gap-3 px-4 py-3 transition hover:bg-brand-50/40"
                >
                  <span className={`h-8 w-1 shrink-0 rounded-full ${ACCENT_BAR[w.level] || ACCENT_BAR.cognition}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-base font-bold text-slate-900">{w.word}</span>
                      <LevelBadge level={w.level} />
                      {w.status === 'new' && (
                        <span className="chip bg-brand-50 text-brand-600 ring-1 ring-brand-100">生词本</span>
                      )}
                      {w.status === 'mastered' && (
                        <span className="chip bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">已掌握</span>
                      )}
                      {w.status === 'favorite' && (
                        <span className="chip bg-amber-50 text-amber-700 ring-1 ring-amber-100">收藏</span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-slate-500">
                      {w.pos} {Array.isArray(w.meanings) ? w.meanings.slice(0, 3).join('；') : ''}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>
        ))
      )}

      {/* 词组短语（如有） */}
      {data.phrases && data.phrases.length > 0 && (
        <section className="card p-4">
          <h2 className="mb-2 text-sm font-bold text-slate-800">词组短语（{data.phrases.length}）</h2>
          <div className="flex flex-wrap gap-2">
            {data.phrases.map((p) => (
              <span key={p.id || p.phrase} className="chip bg-violet-50 text-violet-700 ring-1 ring-violet-100">
                {p.phrase}
                {p.meaning ? ` · ${p.meaning}` : ''}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
