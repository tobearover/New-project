import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  History,
  ImagePlus,
  Keyboard,
  ScanLine,
  Settings2,
  Trash2
} from 'lucide-react';
import { api } from '../api';
import { useApp } from '../store';
import { renderToCanvas, canvasToBlob } from '../utils/preprocess';
import LevelBadge, { LEVEL_LABELS } from '../components/LevelBadge';
import SpeakButton from '../components/SpeakButton';
import StatusButtons from '../components/StatusButtons';
import EmptyState from '../components/EmptyState';

const PREPROCESS_OPTIONS = [
  { key: 'grayscale', label: '灰度增强' },
  { key: 'contrast', label: '提高对比度' },
  { key: 'denoise', label: '去噪' }
];

const TYPE_OPTIONS = [
  { key: 'high_frequency', label: '高频词汇' },
  { key: 'frequent', label: '常考词汇' },
  { key: 'key', label: '重点词汇' },
  { key: 'cognition', label: '认知词汇' }
];

const TYPE_FILTER_KEY = 'smartvocab.scanTypeFilter';
const PHRASES_KEY = 'smartvocab.scanShowPhrases';
const DEFAULT_FILTER = { high_frequency: true, frequent: true, key: true, cognition: true };

function loadFilter() {
  try {
    return { ...DEFAULT_FILTER, ...JSON.parse(localStorage.getItem(TYPE_FILTER_KEY) || '{}') };
  } catch {
    return DEFAULT_FILTER;
  }
}

export default function Scan() {
  const { syllabusId } = useApp();
  const [mode, setMode] = useState('camera'); // camera | upload | text
  const [preview, setPreview] = useState(null); // dataURL 预览
  const [preOptions, setPreOptions] = useState({ grayscale: true, contrast: true, denoise: false });
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [mockText, setMockText] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [duplicate, setDuplicate] = useState(null);
  const [viewingHistory, setViewingHistory] = useState(null); // { id, time }
  const [history, setHistory] = useState([]);
  const [historyWindow, setHistoryWindow] = useState(30);
  const [error, setError] = useState('');
  const [syllabi, setSyllabi] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState(loadFilter);
  const [showPhrases, setShowPhrases] = useState(() => localStorage.getItem(PHRASES_KEY) !== '0');

  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  const streamRef = useRef(null);
  const lastCanvasRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(TYPE_FILTER_KEY, JSON.stringify(typeFilter));
  }, [typeFilter]);

  useEffect(() => {
    localStorage.setItem(PHRASES_KEY, showPhrases ? '1' : '0');
  }, [showPhrases]);

  useEffect(() => {
    api.syllabi().then(setSyllabi).catch(() => {});
    refreshHistory();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshHistory = useCallback(() => {
    api
      .recognitionHistory()
      .then((h) => {
        setHistory(h.items || []);
        setHistoryWindow(h.windowMinutes || 30);
      })
      .catch(() => {});
  }, []);

  const clearHistory = async () => {
    if (!confirm('确定清空识别历史吗？')) return;
    try {
      await api.recognitionHistoryClear();
      setHistory([]);
      setResult(null);
      setViewingHistory(null);
    } catch (err) {
      alert(err.message);
    }
  };

  /** 查看历史识别详情：服务端用记录的完整原文重新提取，返回与实时识别一致的结果 */
  const viewHistory = async (item) => {
    if (busy) return;
    setBusy(true);
    setError('');
    setDuplicate(null);
    try {
      const data = await api.recognitionHistoryItem(item.id);
      setResult(data);
      setViewingHistory({ id: item.id, time: item.createdAt });
      setTimeout(() => {
        resultRef.current && resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  }, []);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      setCameraOn(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 50);
    } catch (err) {
      setCameraError('无法打开摄像头：' + (err.message || '权限被拒绝或设备不支持'));
    }
  };

  const captureFromVideo = () => {
    if (!videoRef.current || !cameraOn) return;
    const canvas = renderToCanvas(videoRef.current, 1800, preOptions);
    lastCanvasRef.current = canvas;
    setPreview(canvas.toDataURL('image/jpeg', 0.92));
  };

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = renderToCanvas(img, 1800, preOptions);
      lastCanvasRef.current = canvas;
      setPreview(canvas.toDataURL('image/jpeg', 0.92));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const reprocessPreview = () => {
    const source = imgRef.current || videoRef.current;
    if (!source) return;
    const canvas = renderToCanvas(source, 1800, preOptions);
    lastCanvasRef.current = canvas;
    setPreview(canvas.toDataURL('image/jpeg', 0.92));
  };

  const submit = async (force = false) => {
    setBusy(true);
    setError('');
    setResult(null);
    setDuplicate(null);
    setViewingHistory(null);
    try {
      const form = new FormData();
      form.append('syllabus', syllabusId);
      if (force) form.append('force', 'true');
      if (mode === 'text') {
        if (!mockText.trim()) throw new Error('请输入题目文本');
        form.append('mockText', mockText);
      } else {
        if (!lastCanvasRef.current) throw new Error('请先拍照或选择图片');
        form.append('image', await canvasToBlob(lastCanvasRef.current, 'image/jpeg'), 'question.jpg');
      }
      const data = await api.recognize(form);
      if (data.duplicate) {
        setDuplicate(data);
      } else {
        setResult(data);
        refreshHistory();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const currentSyllabus = syllabi.find((s) => s.id === syllabusId);

  // 按筛选设置过滤结果分组
  const visibleGroups = result
    ? result.orderedGroups.filter((g) => typeFilter[g.level] !== false && g.words.length > 0)
    : [];
  const enabledTypeCount = TYPE_OPTIONS.filter((t) => typeFilter[t.key]).length;

  const engineLabel = (engine, fallback) =>
    (engine === 'tesseract' ? 'Tesseract OCR' : engine === 'demo' ? '演示文本' : 'OCR') +
    (fallback ? '（已回退）' : '');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 md:text-2xl">题目单词智能识别</h1>
        <p className="mt-1 text-sm text-slate-500">
          拍照或导入题目图片，自动识别英语单词，并按
          <Link to="/exams" className="font-medium text-brand-600 hover:underline">
            「{currentSyllabus ? currentSyllabus.name : syllabusId.toUpperCase()}」
          </Link>
          考纲筛选分类。
        </p>
      </div>

      {/* 顶部可伸缩筛选设置条 */}
      <section className="card overflow-hidden">
        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50/60"
          aria-expanded={settingsOpen}
        >
          <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800">
            <Settings2 className="h-4 w-4 shrink-0 text-brand-600" />
            识别结果筛选设置
            <span className="hidden truncate text-xs font-normal text-slate-400 sm:inline">
              显示 {enabledTypeCount}/4 类词汇{showPhrases ? ' · 含词组' : ' · 不含词组'}
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${settingsOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {settingsOpen && (
          <div className="border-t border-slate-100 px-4 py-4">
            <div className="mb-2 text-xs font-medium text-slate-500">显示词类</div>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((t) => {
                const active = typeFilter[t.key];
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTypeFilter((f) => ({ ...f, [t.key]: !f[t.key] }))}
                    className={`chip ring-1 px-3 py-1.5 transition ${
                      active
                        ? 'bg-brand-600 text-white ring-brand-600'
                        : 'bg-white text-slate-500 ring-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {t.label} {active ? '✓' : ''}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="chip cursor-pointer bg-white text-slate-600 ring-1 ring-slate-300">
                <input
                  type="checkbox"
                  className="mr-1 accent-brand-600"
                  checked={showPhrases}
                  onChange={(e) => setShowPhrases(e.target.checked)}
                />
                显示词组短语
              </label>
              <button
                type="button"
                onClick={() => setTypeFilter({ ...DEFAULT_FILTER })}
                className="text-xs text-brand-600 hover:underline"
              >
                全部显示
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              ['camera', '拍照识别', Camera],
              ['upload', '图片导入', ImagePlus],
              ['text', '粘贴文本', Keyboard]
            ].map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => {
                  setMode(key);
                  setResult(null);
                  setDuplicate(null);
                  setViewingHistory(null);
                  if (key !== 'camera') stopCamera();
                }}
                className={`chip ring-1 px-3.5 py-1.5 transition ${
                  mode === key ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-600 ring-slate-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {mode === 'text' ? (
            <div className="space-y-3">
              <textarea
                className="input min-h-[160px] resize-y font-mono text-sm leading-relaxed"
                placeholder="粘贴/输入题目中的英文句子，用于演示识别与匹配流程…"
                value={mockText}
                onChange={(e) => setMockText(e.target.value)}
              />
            </div>
          ) : mode === 'camera' ? (
            <div className="space-y-3">
              {!cameraOn ? (
                <button onClick={startCamera} className="btn-primary w-full py-8 text-base">
                  <Camera className="h-5 w-5" /> 打开摄像头
                </button>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="max-h-72 w-full rounded-xl bg-slate-900 object-contain"
                  />
                  <div className="flex gap-2">
                    <button onClick={captureFromVideo} className="btn-primary flex-1">
                      拍摄
                    </button>
                    <button onClick={stopCamera} className="btn-secondary">
                      关闭
                    </button>
                  </div>
                </>
              )}
              {cameraError && <p className="text-sm text-red-500">{cameraError}</p>}
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => fileRef.current && fileRef.current.click()}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-8 text-slate-500 hover:border-brand-400 hover:text-brand-600"
              >
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm">从相册 / 文件选择题目图片</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleFile(e.target.files[0]);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          )}

          {preview && mode !== 'text' && (
            <div className="mt-4 space-y-3">
              <img src={preview} alt="待识别题目预览" className="max-h-72 w-full rounded-xl object-contain ring-1 ring-slate-200" />
              <div className="flex flex-wrap gap-1.5">
                {PREPROCESS_OPTIONS.map((opt) => (
                  <label key={opt.key} className="chip cursor-pointer bg-white text-slate-600 ring-1 ring-slate-300">
                    <input
                      type="checkbox"
                      className="mr-1 accent-brand-600"
                      checked={preOptions[opt.key]}
                      onChange={(e) => {
                        setPreOptions({ ...preOptions, [opt.key]: e.target.checked });
                        setTimeout(reprocessPreview, 0);
                      }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => submit()} disabled={busy} className="btn-primary mt-4 w-full py-3">
            <ScanLine className="h-4 w-4" />
            {busy ? '识别中，请稍候…' : '开始识别'}
          </button>
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          {mode !== 'text' && (
            <p className="mt-3 text-xs text-slate-400">
              提示：OCR 首次识别需要下载英文语言包（约 15MB）。若 OCR 不可用，服务会自动回退到演示文本，不影响体验。
            </p>
          )}
        </div>

        <div ref={resultRef} className="scroll-mt-20 space-y-4">
          {!result && !busy && (
            <EmptyState
              icon="🧾"
              title="识别结果将显示在这里"
              desc="识别完成后，考纲内已收录的单词会按高频 / 常考 / 重点 / 认知分组展示，未收录词汇自动过滤。"
            />
          )}

          {duplicate && (
            <div className="card border-l-4 border-l-amber-400 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">已检测到重复识别</div>
                  <p className="mt-1 text-sm text-slate-600">{duplicate.message}</p>
                  {duplicate.previous && (
                    <p className="mt-1 text-xs text-slate-400">
                      上次识别：{duplicate.previous.matchedCount} 个单词
                      {duplicate.previous.matchedWords.length > 0
                        ? `（${duplicate.previous.matchedWords.slice(0, 8).join('、')}${duplicate.previous.matchedWords.length > 8 ? '…' : ''}）`
                        : ''}
                      ，引擎：{engineLabel(duplicate.previous.engine)}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => submit(true)} disabled={busy} className="btn-primary">
                      仍要重新识别
                    </button>
                    <button onClick={() => setDuplicate(null)} className="btn-secondary">
                      知道了
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {result && (
            <>
              <div className="card flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {viewingHistory ? (
                    <History className="h-6 w-6 text-brand-600" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-900">
                      {viewingHistory
                        ? `历史识别结果 · ${new Date(viewingHistory.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
                        : '识别完成'}
                    </div>
                    <div className="text-xs text-slate-500">引擎：{engineLabel(result.engine, result.fallback)}</div>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  匹配 {result.stats.matchedWords} 词 · {result.stats.matchedPhrases} 词组
                  <br />
                  未收录词汇已自动过滤
                </div>
              </div>

              <details className="card p-4">
                <summary className="cursor-pointer text-sm font-medium text-slate-600">查看识别原文</summary>
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-600">
                  {result.rawText}
                </p>
              </details>

              {visibleGroups.length === 0 ? (
                <div className="card flex flex-col items-center gap-2 px-6 py-8 text-center">
                  <div className="text-sm text-slate-500">当前筛选条件下没有可显示的词汇</div>
                  <button
                    type="button"
                    onClick={() => setTypeFilter({ ...DEFAULT_FILTER })}
                    className="btn-secondary mt-1"
                  >
                    显示全部词类
                  </button>
                </div>
              ) : (
                visibleGroups.map((group) => (
                  <div key={group.level} className="card overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <LevelBadge level={group.level} />
                        {LEVEL_LABELS[group.level]}
                      </span>
                      <span className="text-xs text-slate-400">{group.words.length} 个</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {group.words.map((w) => (
                        <div key={w.id} className="flex items-center gap-3 px-4 py-3">
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/words/${encodeURIComponent(w.id)}`}
                              className="font-semibold text-brand-700 hover:underline"
                            >
                              {w.word}
                            </Link>
                            <div className="truncate text-xs text-slate-500">
                              {w.pos} {w.meanings.join('；')}
                            </div>
                          </div>
                          <SpeakButton word={w.word} accent="US" size="sm" />
                          <StatusButtons wordId={w.id} initialStatus={w.status} size="sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}

              {showPhrases && result.phrases.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 text-sm font-semibold text-slate-800">
                    词组短语（{result.phrases.length}）
                  </div>
                  <div className="divide-y divide-slate-100">
                    {result.phrases.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <span className="font-semibold text-slate-800">{p.phrase}</span>
                        <span className="text-xs text-slate-500">{p.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <History className="h-4 w-4 text-brand-600" />
            识别历史（{historyWindow} 分钟窗口内自动去重）
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
              清空历史
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">暂无识别记录</p>
        ) : (
          <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {history.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => viewHistory(h)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-brand-50/40"
                title="查看该次识别结果"
              >
                {h.engine === 'tesseract' ? (
                  <Camera className="h-5 w-5 shrink-0 text-slate-400" />
                ) : (
                  <FileText className="h-5 w-5 shrink-0 text-slate-400" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">
                      {new Date(h.createdAt).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="chip bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                      {(h.syllabus || 'all').toUpperCase()}
                    </span>
                    <span>匹配 {h.matchedCount} 词</span>
                    {h.engine === 'demo' && <span>演示文本</span>}
                  </div>
                  <div className="mt-1 truncate text-sm text-slate-600">{h.rawText}</div>
                  {h.matchedWords.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {h.matchedWords.slice(0, 10).map((w) => (
                        <span key={w} className="chip bg-slate-100 text-slate-600">
                          {w}
                        </span>
                      ))}
                      {h.matchedWords.length > 10 && (
                        <span className="chip bg-slate-100 text-slate-400">+{h.matchedWords.length - 10}</span>
                      )}
                    </div>
                  )}
                </div>
                <Eye className="h-4 w-4 shrink-0 text-slate-300" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
