import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiBaseUrl } from '../src/utils/apiBase.js';

test('uses the configured API URL when present', () => {
  const url = resolveApiBaseUrl({ VITE_API_URL: 'https://example.com/api' });
  assert.equal(url, 'https://example.com/api');
});

test('falls back to the deployed backend URL when no API URL is configured', () => {
  const url = resolveApiBaseUrl({});
  assert.equal(url, 'https://gebeya-b-api.onrender.com/api');
});
