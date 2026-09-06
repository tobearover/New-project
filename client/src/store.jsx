import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { clearAuth, getStoredUser, getToken, setAuth } from './utils/storage';

const KEY = 'smartvocab.syllabus';
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
  const [user, setUser] = useState(getStoredUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }
    api
      .authMe()
      .then((res) => setUser(res.user))
      .catch(() => {
        clearAuth();
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const saveAuth = useCallback((token, user, remember = true) => {
    setAuth(token, user, remember);
    setUser(user);
  }, []);

  const login = useCallback(
    async (username, password, remember = true) => {
      const res = await api.authLogin(username, password);
      saveAuth(res.token, res.user, remember);
      return res.user;
    },
    [saveAuth]
  );

  const register = useCallback(
    async (username, password, remember = true) => {
      const res = await api.authRegister(username, password);
      saveAuth(res.token, res.user, remember);
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
    clearAuth();
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
