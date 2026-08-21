import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Lock, User } from 'lucide-react';
import { useApp, useAuth } from '../store';

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('请输入用户名和密码');
      return;
    }
    if (mode === 'register' && password !== confirm) {
      setError('两次输入的密码不一致');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') await login(username.trim(), password);
      else await register(username.trim(), password);
      refreshStats();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
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
          <h1 className="text-xl font-bold text-slate-900">
            {mode === 'login' ? '登录 SmartVocab' : '注册账号'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            登录后生词本、复习与历史记录将与账号绑定
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
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
              }}
              className={`rounded-lg py-2 text-sm font-medium transition ${
                mode === key ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">用户名</span>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9"
                placeholder="2-20 位中文/字母/数字"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">密码</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9"
                type="password"
                placeholder="至少 6 位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </label>

          {mode === 'register' && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">确认密码</span>
              <input
                className="input"
                type="password"
                placeholder="再次输入密码"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full py-3">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === 'login' ? '登录' : '注册并登录'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          返回
          <Link to="/" className="ml-1 text-brand-600 hover:underline">
            首页
          </Link>
        </p>
      </div>
    </div>
  );
}
