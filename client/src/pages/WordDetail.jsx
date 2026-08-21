import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import { api } from '../api';
import { useSpeech, englishPart } from '../utils/speech';
import LevelBadge from '../components/LevelBadge';
import SpeakButton from '../components/SpeakButton';
import StatusButtons from '../components/StatusButtons';
import WordListCard from '../components/WordListCard';
import EmptyState from '../components/EmptyState';

function Section({ title, children }) {
  return (
    <section className="card p-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">{title}</h2>
      {children}
    </section>
  );
}

/** 例句朗读：整句按钮 + 逐词点击朗读 */
function SpeakableSentence({ sentence }) {
  const { speaking, speak } = useSpeech();
  const words = sentence.split(/(\s+)/);
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-medium leading-relaxed text-slate-800">
        {words.map((w, i) =>
          /\s/.test(w) ? (
            <span key={i}>{w}</span>
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => speak(w, 'en-US')}
              className={`rounded px-0.5 transition hover:bg-brand-100 hover:text-brand-700 ${
                speaking === w ? 'bg-brand-100 text-brand-700 underline' : ''
              }`}
              title="点击朗读该单词"
            >
              {w}
            </button>
          )
        )}
      </p>
      <button
        type="button"
        onClick={() => speak(sentence, 'en-US')}
        title={speaking === sentence ? '停止播放' : '朗读整句'}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 transition ${
          speaking === sentence
            ? 'bg-brand-100 text-brand-700 ring-brand-300'
            : 'bg-brand-50 text-brand-600 ring-brand-100 hover:bg-brand-100'
        }`}
      >
        {speaking === sentence ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export default function WordDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .word(id)
      .then((w) => {
        setData(w);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="py-16 text-center text-slate-500">单词详情加载中…</div>;
  if (error) return <EmptyState icon="⚠️" title="无法加载" desc={error} />;
  if (!data) return null;

  const w = data;
  return (
    <div className="space-y-4">
      <Link to="/words" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        ← 返回单词列表
      </Link>

      <section className="card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{w.word}</h1>
              <LevelBadge level={w.level} />
              {w.status && (
                <span className="chip bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                  {w.status === 'new' ? '📝 已在生词本' : w.status === 'mastered' ? '✅ 已掌握' : '⭐ 已收藏'}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="font-medium text-slate-700">{w.pos}</span>
              {w.phoneticUK && <span>英 {w.phoneticUK}</span>}
              {w.phoneticUS && <span>美 {w.phoneticUS}</span>}
              <SpeakButton word={w.word} accent="UK" size="sm" />
              <SpeakButton word={w.word} accent="US" size="sm" />
            </div>
          </div>
          <StatusButtons wordId={w.id} initialStatus={w.status} />
        </div>

        <div className="mt-4 rounded-xl bg-brand-50/70 p-4">
          {w.meanings.map((m, i) => (
            <div key={i} className="flex items-baseline gap-2 py-0.5">
              <span className="text-brand-500">▸</span>
              <span className="text-slate-800">{m}</span>
            </div>
          ))}
        </div>
      </section>

      {w.examPoint && (
        <Section title="考点解析">
          <p className="text-sm leading-relaxed text-slate-700">{w.examPoint}</p>
        </Section>
      )}

      {w.examples && w.examples.length > 0 && (
        <Section title="例句">
          <div className="space-y-3">
            {w.examples.map((ex, i) => (
              <div key={i} className="rounded-xl bg-slate-50 p-4">
                <SpeakableSentence sentence={ex.en} />
                <p className="mt-1 text-sm text-slate-500">{ex.zh}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(w.synonyms?.length > 0 || w.antonyms?.length > 0) && (
          <Section title="同义词 / 反义词">
            <div className="space-y-2 text-sm">
              {w.synonyms?.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-400">同义：</span>
                  {w.synonyms.map((s) => (
                    <span key={s} className="chip bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">{s}</span>
                  ))}
                </div>
              )}
              {w.antonyms?.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-400">反义：</span>
                  {w.antonyms.map((s) => (
                    <span key={s} className="chip bg-red-50 text-red-600 ring-1 ring-red-100">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </Section>
        )}

        {w.collocations?.length > 0 && (
          <Section title="常见搭配">
            <div className="flex flex-wrap gap-1.5">
              {w.collocations.map((c) => (
                <span key={c} className="chip bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  {c}
                  <SpeakButton text={englishPart(c)} accent="US" size="sm" title="朗读该搭配" />
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>

      {w.derivatives?.length > 0 && (
        <Section title="派生词">
          <div className="flex flex-wrap gap-1.5">
            {w.derivatives.map((d) => (
              <span key={d} className="chip bg-violet-50 text-violet-700 ring-1 ring-violet-100">{d}</span>
            ))}
          </div>
        </Section>
      )}

      {w.realExam?.length > 0 && (
        <Section title="真题示例">
          <div className="space-y-3">
            {w.realExam.map((r, i) => (
              <div key={i} className="rounded-xl bg-amber-50/60 p-4 ring-1 ring-amber-100">
                <div className="text-xs font-semibold text-amber-600">{r.source}</div>
                <div className="mt-1">
                  <SpeakableSentence sentence={r.sentence} />
                </div>
                {r.note && <p className="mt-1 text-xs text-slate-500">{r.note}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {w.memoryTip && (
        <Section title="记忆技巧">
          <p className="text-sm leading-relaxed text-slate-700">💡 {w.memoryTip}</p>
        </Section>
      )}

      {w.related?.length > 0 && (
        <Section title="相关单词推荐">
          <div className="space-y-2.5">
            {w.related.map((r) => (
              <WordListCard key={r.id} item={r} />
            ))}
          </div>
        </Section>
      )}

      {w.relatedPhrases?.length > 0 && (
        <Section title="同考纲词组">
          <div className="space-y-2">
            {w.relatedPhrases.map((p) => (
              <div key={p.id} className="flex items-baseline justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  {p.phrase}
                  <SpeakButton text={p.phrase} accent="US" size="sm" title="朗读该词组" />
                </span>
                <span className="text-sm text-slate-500">{p.meaning}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
