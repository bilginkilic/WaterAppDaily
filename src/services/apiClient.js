const API_URL =
  process.env.API_URL ||
  (typeof __DEV__ !== 'undefined' && __DEV__
    ? 'http://localhost:3001/api'
    : 'https://waterappdashboard2.onrender.com/api');

export const TOKEN_EXPIRED = 'TOKEN_EXPIRED';

let onSessionExpired = null;

export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

/**
 * Authenticated API request. Throws TOKEN_EXPIRED on 401 when a token was sent.
 */
export async function apiRequest(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && token) {
    if (typeof onSessionExpired === 'function') {
      await onSessionExpired();
    }
    throw new Error(TOKEN_EXPIRED);
  }

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed (${response.status})`);
  }

  return data;
}

export { API_URL };
