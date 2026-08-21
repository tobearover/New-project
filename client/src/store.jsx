import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';

const KEY = 'smartvocab.syllabus';
const TOKEN_KEY = 'smartvocab.token';
const USER_KEY = 'smartvocab.user';
const AppContext = createContext(null);
const AuthContext = createContext(null);

export function AppProvider({ children }) {
  const [syllabusId, setSyllabusId] = useState(() => localStorage.getItem(KEY) || 'cet4');
  const [stats, setStats] = useState(null);

  const refreshStats = useCallback(async () => {
    try {
      setStats(await api.wordbookStats());
    } catch {
      // 未登录 / 后端不可用时清空统计，避免展示过期数据
      setStats(null);
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const selectSyllabus = useCallback((id) => {
    localStorage.setItem(KEY, id);
    setSyllabusId(id);
  }, []);

  return (
    <AppContext.Provider value={{ syllabusId, selectSyllabus, stats, refreshStats }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setReady(true);
      return;
    }
    api
      .authMe()
      .then((res) => setUser(res.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const saveAuth = useCallback((token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  }, []);

  const login = useCallback(
    async (username, password) => {
      const res = await api.authLogin(username, password);
      saveAuth(res.token, res.user);
      return res.user;
    },
    [saveAuth]
  );

  const register = useCallback(
    async (username, password) => {
      const res = await api.authRegister(username, password);
      saveAuth(res.token, res.user);
      return res.user;
    },
    [saveAuth]
  );

  const logout = useCallback(async () => {
    try {
      await api.authLogout();
    } catch {
      /* 忽略网络异常，本地凭证照常清除 */
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
