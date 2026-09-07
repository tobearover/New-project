import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { clearAuth, getStoredUser, getToken, setAuth } from './utils/storage';

const KEY = 'smartvocab.syllabus';
const AppContext = createContext(null);
const AuthContext = createContext(null);

export function AppProvider({ children }) {
  const [syllabusId, setSyllabusId] = useState(() => localStorage.getItem(KEY) || 'cet4');
  const [stats, setStats] = useState(null);
  const [wordbookStatus, setWordbookStatus] = useState({});
  const [wordbookStatusLoaded, setWordbookStatusLoaded] = useState(false);

  const refreshStats = useCallback(async () => {
    try {
      setStats(await api.wordbookStats());
    } catch {
      // 未登录 / 后端不可用时清空统计，避免展示过期数据
      setStats(null);
    }
  }, []);

  // 生词本状态单一数据源：wordId -> status（null/移除后不存在）
  const refreshWordbookStatus = useCallback(async () => {
    try {
      const res = await api.wordbook();
      const map = {};
      for (const it of res.items || []) {
        if (it && it.wordId) map[it.wordId] = it.status || null;
      }
      setWordbookStatus(map);
      setWordbookStatusLoaded(true);
    } catch {
      // 未登录或接口失败：不改变已加载状态，避免页面误判
    }
  }, []);

  // 登录/登出后统计变化时联动刷新一次词条状态
  useEffect(() => {
    if (stats) refreshWordbookStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats && stats.total, wordbookStatusLoaded === false]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const selectSyllabus = useCallback((id) => {
    localStorage.setItem(KEY, id);
    setSyllabusId(id);
  }, []);

  return (
    <AppContext.Provider
      value={{
        syllabusId,
        selectSyllabus,
        stats,
        refreshStats,
        wordbookStatus,
        wordbookStatusLoaded,
        refreshWordbookStatus
      }}
    >
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
