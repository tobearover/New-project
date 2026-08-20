import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';

const KEY = 'smartvocab.syllabus';
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [syllabusId, setSyllabusId] = useState(() => localStorage.getItem(KEY) || 'cet4');
  const [stats, setStats] = useState(null);

  const refreshStats = useCallback(async () => {
    try {
      setStats(await api.wordbookStats());
    } catch {
      /* 后端未启动时静默 */
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
