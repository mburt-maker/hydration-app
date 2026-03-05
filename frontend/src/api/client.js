const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('hydration_token');

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

export const api = {
  // Auth
  register: (email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  // User
  getMe: () =>
    request('/users/me'),

  updateMe: (data) =>
    request('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),

  completeOnboarding: (data) =>
    request('/users/onboarding', { method: 'POST', body: JSON.stringify(data) }),

  // Beverages
  getCategories: () =>
    request('/beverages/categories'),

  getTodayLogs: (timezone) =>
    request(`/beverages/today?timezone=${encodeURIComponent(timezone)}`),

  logBeverage: (data) =>
    request('/beverages/log', { method: 'POST', body: JSON.stringify(data) }),

  updateLog: (id, data, timezone) =>
    request(`/beverages/${id}?timezone=${encodeURIComponent(timezone)}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  deleteLog: (id, timezone) =>
    request(`/beverages/${id}?timezone=${encodeURIComponent(timezone)}`, { method: 'DELETE' }),

  // Stats
  getHistory: (period, timezone) =>
    request(`/stats/history?period=${period}&timezone=${encodeURIComponent(timezone)}`),
};

export const getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
