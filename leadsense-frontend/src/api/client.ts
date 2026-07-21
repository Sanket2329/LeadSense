import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

if (!BASE_URL && import.meta.env.DEV) {
  console.warn(
    '[apiClient] VITE_API_BASE_URL is not set — requests will go to the same origin via proxy.',
  );
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000, // 10 s — fail fast rather than hang indefinitely
});

// ── Request interceptor: attach JWT from localStorage ──────────────────────────
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: normalize errors + redirect on 401 ──────────────────
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    if (!error.response && (error.message === 'Network Error' || error.code === 'ECONNABORTED')) {
      return Promise.reject(
        new Error('API is unreachable or timed out. Please check your connection and try again.'),
      );
    }

    const message =
      error.response?.data?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject(new Error(message));
  },
);
