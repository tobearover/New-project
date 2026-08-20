import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [error, setError] = useState('');
  const [syllabi, setSyllabi] = useState([]);

  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  const streamRef = useRef(null);
  const lastCanvasRef = useRef(null);

  useEffect(() => {
    api.syllabi().then(setSyllabi).catch(() => {});
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const submit = async () => {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const form = new FormData();
      form.append('syllabus', syllabusId);
      if (mode === 'text') {
        if (!mockText.trim()) throw new Error('请输入题目文本');
        form.append('mockText', mockText);
      } else {
        if (!lastCanvasRef.current) throw new Error('请先拍照或选择图片');
        form.append('image', await canvasToBlob(lastCanvasRef.current, 'image/jpeg'), 'question.jpg');
      }
      const data = await api.recognize(form);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const currentSyllabus = syllabi.find((s) => s.id === syllabusId);

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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              ['camera', '📷 拍照识别'],
              ['upload', '🖼️ 图片导入'],
              ['text', '⌨️ 粘贴文本']
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setMode(key);
                  setResult(null);
                  if (key !== 'camera') stopCamera();
                }}
                className={`chip ring-1 px-3.5 py-1.5 transition ${
                  mode === key ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-600 ring-slate-300'
                }`}
              >
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
                  📷 打开摄像头
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
                <span className="text-3xl">🖼️</span>
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

          <button onClick={submit} disabled={busy} className="btn-primary mt-4 w-full py-3">
            {busy ? '识别中，请稍候…' : '开始识别'}
          </button>
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          {mode !== 'text' && (
            <p className="mt-3 text-xs text-slate-400">
              提示：OCR 首次识别需要下载英文语言包（约 15MB）。若 OCR 不可用，服务会自动回退到演示文本，不影响体验。
            </p>
          )}
        </div>

        <div className="space-y-4">
          {!result && !busy && (
            <EmptyState
              icon="🧾"
              title="识别结果将显示在这里"
              desc="识别完成后，单词会按高频 / 常考 / 重点 / 认知分组展示，并标注在生词本中的状态。"
            />
          )}

          {result && (
            <>
              <div className="card flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="font-semibold text-slate-900">识别完成</div>
                    <div className="text-xs text-slate-500">
                      引擎：{result.engine === 'tesseract' ? 'Tesseract OCR' : result.engine === 'demo' ? '演示文本' : 'OCR'}
                      {result.fallback ? '（已回退）' : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  匹配 {result.stats.matchedWords} 词 · {result.stats.matchedPhrases} 词组
                  <br />
                  未收录 {result.stats.unknownWords} 词
                </div>
              </div>

              <details className="card p-4">
                <summary className="cursor-pointer text-sm font-medium text-slate-600">查看识别原文</summary>
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-600">
                  {result.rawText}
                </p>
              </details>

              {result.orderedGroups
                .filter((g) => g.words.length > 0)
                .map((group) => (
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
                ))}

              {result.phrases.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 text-sm font-semibold text-slate-800">
                    🧩 词组短语（{result.phrases.length}）
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

              {result.unknowns.length > 0 && (
                <div className="card p-4">
                  <div className="text-sm font-semibold text-slate-800">
                    未收录 / 超出考纲（{result.unknowns.length}）
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {result.unknowns.map((u) => (
                      <span key={u.token} className="chip bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                        {u.token}
                        {u.count > 1 ? ` ×${u.count}` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
