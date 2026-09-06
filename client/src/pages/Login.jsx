import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Eye, EyeOff, Loader2, Lock, User } from 'lucide-react';
import { useApp, useAuth } from '../store';

const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
  }`;

function validateField(name, value) {
  if (name === 'username') {
    if (!value) return '请输入用户名';
    if (!/^[\w\u4e00-\u9fa5]{2,20}$/.test(String(value).trim())) return '用户名需为 2-20 位中文/字母/数字/下划线';
  }
  if (name === 'password') {
    if (!value) return '请输入密码';
    if (String(value).length < 6) return '密码至少 6 个字符';
  }
  if (name === 'confirm') {
    return '';
  }
  return '';
}

export default function Login() {
  const { login, register } = useAuth();
  const { refreshStats } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [mode, setMode] = useState('login'); // login | register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onFieldChange = (name, value) => {
    if (name === 'username') setUsername(value);
    if (name === 'password') setPassword(value);
    if (name === 'confirm') setConfirm(value);
    const message = validateField(name, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const fieldErrors = {};
    for (const [name, value] of [
      ['username', username],
      ['password', password]
    ]) {
      const message = validateField(name, value);
      if (message) fieldErrors[name] = message;
    }
    if (mode === 'register' && password !== confirm) fieldErrors.confirm = '两次输入的密码不一致';
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setBusy(true);
    try {
      if (mode === 'login') await login(username.trim(), password, remember);
      else await register(username.trim(), password, remember);
      refreshStats();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || '操作失败，请重试');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6 md:p-8">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-400 text-lg font-bold text-white">
            SV
          </div>
          <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
            {mode === 'login' ? '登录 SmartVocab' : '注册账号'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            登录后生词本、复习与历史记录将与账号绑定
          </p>
        </div>

        {/* Tab 式登录 / 注册切换 */}
        <div className="mb-5 flex rounded-xl bg-slate-100 p-1">
          {[
            ['login', '登录'],
            ['register', '注册']
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setMode(key);
                setError('');
                setErrors({});
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                mode === key ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="login-username" className="mb-1 block text-sm font-medium text-slate-600">
              用户名
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="login-username"
                className={`${inputClass(errors.username)} pl-9`}
                placeholder="2-20 位中文/字母/数字/下划线"
                value={username}
                onChange={(e) => onFieldChange('username', e.target.value)}
                autoFocus
                autoComplete="username"
              />
            </div>
            {errors.username && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                <AlertTriangle className="h-3.5 w-3.5" />
                {errors.username}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-slate-600">
              密码
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="login-password"
                className={`${inputClass(errors.password)} pl-9 pr-10`}
                type={showPassword ? 'text' : 'password'}
                placeholder="至少 6 位"
                value={password}
                onChange={(e) => onFieldChange('password', e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                <AlertTriangle className="h-3.5 w-3.5" />
                {errors.password}
              </p>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="login-confirm" className="mb-1 block text-sm font-medium text-slate-600">
                确认密码
              </label>
              <input
                id="login-confirm"
                className={inputClass(errors.confirm)}
                type={showPassword ? 'text' : 'password'}
                placeholder="再次输入密码"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  const message = e.target.value !== password ? '两次输入的密码不一致' : '';
                  setErrors((prev) => {
                    const next = { ...prev };
                    if (message) next.confirm = message;
                    else delete next.confirm;
                    return next;
                  });
                }}
                autoComplete="new-password"
              />
              {errors.confirm && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {errors.confirm}
                </p>
              )}
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="accent-brand-600"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                记住我
              </label>
              <button
                type="button"
                onClick={() => setError('请联系管理员重置密码')}
                className="text-sm text-brand-600 hover:underline"
              >
                忘记密码？
              </button>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy
              ? mode === 'login'
                ? '登录中…'
                : '注册中…'
              : mode === 'login'
                ? '登录'
                : '注册并登录'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400">
          返回
          <Link to="/" className="ml-1 text-brand-600 hover:underline">
            首页
          </Link>
        </p>
      </div>
    </div>
  );
}
