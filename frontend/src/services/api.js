import axios from 'axios';
import { resolveApiBaseUrl } from '../utils/apiBase';

const baseURL = resolveApiBaseUrl(import.meta.env);

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — but NOT on auth endpoints, and NOT when already on /login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isAuthRoute = url.includes('/auth/');
    const onLoginPage = window.location.pathname === '/login';
    if (err.response?.status === 401 && !isAuthRoute && !onLoginPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
