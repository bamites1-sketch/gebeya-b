import axios from 'axios';

// Strip any accidental trailing slash then append /api if missing
const raw = (import.meta.env.VITE_API_URL || 'https://gebeya-b-api.onrender.com/api').trim().replace(/\/$/, '');
const baseURL = raw.endsWith('/api') ? raw : `${raw}/api`;

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

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
