const BASE = '/api';
const TOKEN_KEY = 'smartvocab.token';
const USER_KEY = 'smartvocab.user';

async function request(path, options = {}) {
  const opts = { ...options };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    opts.headers = { ...(opts.headers || {}), Authorization: `Bearer ${token}` };
  }
  if (!(opts.body instanceof FormData) && opts.body && typeof opts.body !== 'string') {
    opts.body = JSON.stringify(opts.body);
    opts.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  }
  const res = await fetch(BASE + path, opts);
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  // 登录失效：清除本地凭证（登录/注册接口的 401/400 除外）
  if (res.status === 401 && !path.startsWith('/auth/')) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  if (!res.ok) {
    throw new Error((data && data.error) || `请求失败（${res.status}）`);
  }
  return data;
}

export const api = {
  authRegister: (username, password) =>
    request('/auth/register', { method: 'POST', body: { username, password } }),
  authLogin: (username, password) =>
    request('/auth/login', { method: 'POST', body: { username, password } }),
  authLogout: () => request('/auth/logout', { method: 'POST' }),
  authMe: () => request('/auth/me'),
  syllabi: () => request('/syllabi'),
  words: (params = {}) => request(`/words?${new URLSearchParams(params)}`),
  word: (id) => request(`/words/${encodeURIComponent(id)}`),
  recognize: (formData) => request('/recognition', { method: 'POST', body: formData }),
  recognitionHistory: (limit = 20) => request(`/recognition/history?limit=${limit}`),
  recognitionHistoryItem: (id) => request(`/recognition/history/${encodeURIComponent(id)}`),
  recognitionHistoryClear: () => request('/recognition/history', { method: 'DELETE' }),
  history: (params = {}) => request(`/history?${new URLSearchParams(params)}`),
  historyItem: (id) => request(`/history/${encodeURIComponent(id)}`),
  historyDelete: (id) => request(`/history/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  historyDeleteBatch: (ids) =>
    request('/history', { method: 'DELETE', body: { ids } }),
  wordbook: (params = {}) => request(`/wordbook?${new URLSearchParams(params)}`),
  wordbookStats: () => request('/wordbook/stats'),
  wordbookAdd: (wordId, status = 'new') =>
    request('/wordbook', { method: 'POST', body: { wordId, status } }),
  wordbookUpdate: (wordId, status) =>
    request(`/wordbook/${encodeURIComponent(wordId)}`, { method: 'PATCH', body: { status } }),
  wordbookRemove: (wordId) =>
    request(`/wordbook/${encodeURIComponent(wordId)}`, { method: 'DELETE' }),
  reviewDue: () => request('/review/due'),
  reviewComplete: (wordId, result) =>
    request('/review/complete', { method: 'POST', body: { wordId, result } }),
  quiz: (params = {}) => request(`/quiz?${new URLSearchParams(params)}`),
  quizAnswer: (payload) => request('/quiz/answer', { method: 'POST', body: payload })
};
