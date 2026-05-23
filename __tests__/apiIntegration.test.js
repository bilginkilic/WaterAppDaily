/**
 * Mobile-like API integration (register → survey profile → task update).
 * Requires local API at http://localhost:3001/api
 */
const API_BASE = process.env.API_URL || 'http://localhost:3001/api';

async function api(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

describe('Mobile API integration flow', () => {
  const runId = `mob-${Date.now()}`;
  let token;
  let userId;

  it('health check', async () => {
    const res = await fetch(`${API_BASE.replace('/api', '')}/api/health`);
    expect(res.ok).toBe(true);
  });

  it('registers and creates survey profile like mobile app', async () => {
    const email = `mobile-it-${runId}@waterapp.test`;
    const { status, data } = await api('/auth/register', {
      method: 'POST',
      body: { email, password: 'Mobile123!', name: 'Mobile IT User' },
    });
    expect(status).toBe(201);
    token = data.token;
    userId = data.userId;

    const answers = [
      { questionId: 1, answer: 'Yes', valueTotal: 15, valueSaving: 10, type: 'Achievement', category: 'dishwashing' },
      { questionId: 2, answer: 'No', valueTotal: 36, valueSaving: 21, type: 'Task', category: 'dishwashing' },
    ];
    const profile = await api('/waterprint/initial-profile', {
      method: 'POST',
      token,
      body: { initialWaterprint: 51, answers, correctAnswersCount: 1 },
    });
    expect(profile.status).toBe(201);
  });

  it('completes a challenge task and reduces footprint', async () => {
    const update = await api('/waterprint/update', {
      method: 'POST',
      token,
      body: { currentWaterprint: 51, taskId: 'q2', waterprintReduction: 21 },
    });
    expect(update.status).toBe(200);
    expect(update.data.newWaterprint).toBe(30);
  });

  it('reads progress with auth token', async () => {
    const progress = await api(`/waterprint/progress/${userId}`, { token });
    expect(progress.status).toBe(200);
    expect(progress.data.currentWaterprint).toBe(30);
  });
});
