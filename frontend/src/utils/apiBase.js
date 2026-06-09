export function resolveApiBaseUrl(env = import.meta.env) {
  const raw = (env?.VITE_API_URL || 'https://gebeya-b-api.onrender.com/api').trim().replace(/\/$/, '');
  return raw.endsWith('/api') ? raw : `${raw}/api`;
}
