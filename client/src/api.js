const BASE = '/api';

async function request(path, options = {}) {
  const opts = { ...options };
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
  if (!res.ok) {
    throw new Error((data && data.error) || `请求失败（${res.status}）`);
  }
  return data;
}

export const api = {
  syllabi: () => request('/syllabi'),
  words: (params = {}) => request(`/words?${new URLSearchParams(params)}`),
  word: (id) => request(`/words/${encodeURIComponent(id)}`),
  recognize: (formData) => request('/recognition', { method: 'POST', body: formData }),
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
