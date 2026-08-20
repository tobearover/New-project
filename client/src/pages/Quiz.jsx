import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../store';
import EmptyState from '../components/EmptyState';

const TYPES = [
  ['meaning', '词义匹配', '看单词选释义', '🔤'],
  ['spelling', '单词拼写', '看释义拼单词', '⌨️'],
  ['listening', '听力辨词', '听发音选释义', '🎧'],
  ['exam', '真题模拟', '真题句子选词', '📝']
];

export default function Quiz() {
  const { syllabusId, refreshStats } = useApp();
  const [type, setType] = useState('meaning');
  const [syllabi, setSyllabi] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [wrong, setWrong] = useState([]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const playedRef = useRef(false);

  useEffect(() => {
    api.syllabi().then(setSyllabi).catch(() => {});
  }, []);

  const start = async () => {
    setLoading(true);
    setError('');
    setQuiz(null);
    setIdx(0);
    setWrong([]);
    setScore(0);
    setDone(false);
    setChecked(false);
    setSelected(null);
    setInput('');
    try {
      const q = await api.quiz({ type, syllabus: syllabusId, count: 8 });
      setQuiz(q);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const speak = (word) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (quiz && quiz.type === 'listening' && !checked && !playedRef.current) {
      const t = setTimeout(() => speak(quiz.questions[idx].word), 350);
      playedRef.current = true;
      return () => clearTimeout(t);
    }
    playedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, idx, checked]);

  const question = quiz?.questions?.[idx];

  const submit = async (correct) => {
    setChecked(true);
    if (correct) setScore((s) => s + 1);
    else setWrong((w) => [...w, question]);
    try {
      await api.quizAnswer({ wordId: question.wordId, questionType: quiz.type, correct });
      refreshStats();
    } catch {
      /* 忽略 */
    }
  };

  const checkSpelling = () => {
    const correct = input.trim().toLowerCase() === question.answer.toLowerCase();
    submit(correct);
  };

  const next = () => {
    if (idx + 1 >= quiz.questions.length) {
      setDone(true);
      return;
    }
    setIdx(idx + 1);
    setChecked(false);
    setSelected(null);
    setInput('');
  };

  if (!quiz)
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 md:text-2xl">智能测验</h1>
          <p className="mt-1 text-sm text-slate-500">基于当前考纲词库自动出题，答错自动收入生词本。</p>
        </div>

        <div className="card space-y-4 p-5">
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">测验类型</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {TYPES.map(([key, label, desc, icon]) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={`rounded-xl p-3 text-left ring-1 transition ${
                    type === key ? 'bg-brand-50 ring-2 ring-brand-500' : 'bg-white ring-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xl">{icon}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{label}</div>
                  <div className="text-xs text-slate-500">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">考纲范围</div>
            <select
              className="input"
              value={syllabusId}
              disabled
              title="当前考纲"
            >
              {syllabi.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              当前使用已选考纲（{syllabusId.toUpperCase()}），可在「考纲选择」页更换。
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={start} disabled={loading} className="btn-primary w-full py-3">
            {loading ? '正在出题…' : '开始测验'}
          </button>
        </div>
      </div>
    );

  if (done)
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          icon={score / quiz.questions.length >= 0.8 ? '🏆' : '📊'}
          title={`答对 ${score} / ${quiz.questions.length}`}
          desc={score / quiz.questions.length >= 0.8 ? '表现很棒，继续保持！' : '答错的单词已自动加入生词本，记得复习。'}
          action={
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button onClick={start} className="btn-primary">再测一次</button>
              <Link to="/wordbook" className="btn-secondary">查看生词本</Link>
            </div>
          }
        />
        {wrong.length > 0 && (
          <div className="card mt-4 p-5">
            <div className="mb-2 text-sm font-semibold text-slate-800">错题回顾</div>
            <div className="space-y-2">
              {wrong.map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-xl bg-red-50/60 px-4 py-2.5">
                  <Link to={`/words/${encodeURIComponent(w.wordId)}`} className="font-semibold text-red-600 hover:underline">
                    {w.word}
                  </Link>
                  <span className="text-xs text-slate-500">正确答案：{w.answer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <button onClick={() => setQuiz(null)} className="hover:text-brand-600">
          ← 退出测验
        </button>
        <span>
          {idx + 1} / {quiz.questions.length} · 得分 {score}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full bg-brand-600 transition-all" style={{ width: `${(idx / quiz.questions.length) * 100}%` }} />
      </div>

      <div className="card p-6">
        <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {TYPES.find((t) => t[0] === quiz.type)?.[1]} · 第 {idx + 1} 题
        </div>

        <div className="min-h-[80px] text-center">
          {quiz.type === 'spelling' || quiz.type === 'exam' ? (
            <div>
              <p className="text-base font-medium leading-relaxed text-slate-800">{question.prompt}</p>
              {quiz.type === 'exam' && (
                <button
                  onClick={() => speak(question.word)}
                  className="mt-2 text-xs text-brand-600 hover:underline"
                  title="播放该词发音"
                >
                  🔊 播放 {question.word} 发音
                </button>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => speak(question.word)}
                className="text-4xl font-bold text-slate-900 hover:text-brand-600"
                title="播放发音"
              >
                {question.word}
                {quiz.type === 'listening' && ' 🎧'}
              </button>
              <p className="mt-2 text-sm text-slate-400">{question.prompt}</p>
            </>
          )}
        </div>

        {quiz.type === 'spelling' ? (
          <div className="mt-6 space-y-3">
            <input
              className="input text-center text-lg"
              placeholder="输入英文单词"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !checked && input.trim() && checkSpelling()}
              disabled={checked}
              autoFocus
            />
            {checked && (
              <div className={`rounded-xl p-3 text-center text-sm ${input.trim().toLowerCase() === question.answer.toLowerCase() ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {input.trim().toLowerCase() === question.answer.toLowerCase()
                  ? '✅ 正确！'
                  : `正确答案：${question.answer}`}
              </div>
            )}
            <button
              onClick={checkSpelling}
              disabled={checked || !input.trim()}
              className="btn-primary w-full py-3"
            >
              提交
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-2.5">
            {question.options.map((opt) => {
              let cls = 'bg-white ring-slate-200 hover:bg-slate-50';
              if (checked) {
                if (opt.correct) cls = 'bg-emerald-50 text-emerald-800 ring-emerald-300';
                else if (selected === opt.id) cls = 'bg-red-50 text-red-700 ring-red-300';
                else cls = 'bg-slate-50 text-slate-400 ring-slate-200';
              } else if (selected === opt.id) {
                cls = 'bg-brand-50 ring-2 ring-brand-500';
              }
              return (
                <button
                  key={opt.id}
                  disabled={checked}
                  onClick={() => {
                    if (checked) return;
                    setSelected(opt.id);
                    submit(opt.correct);
                  }}
                  className={`rounded-xl px-4 py-3 text-left text-sm ring-1 transition ${cls}`}
                >
                  {opt.text}
                  {checked && opt.correct && ' ✓'}
                </button>
              );
            })}
          </div>
        )}

        {checked && (
          <button onClick={next} className="btn-primary mt-4 w-full py-3">
            {idx + 1 >= quiz.questions.length ? '查看结果' : '下一题 →'}
          </button>
        )}
      </div>
    </div>
  );
}
