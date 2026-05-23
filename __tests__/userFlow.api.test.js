/**
 * Full user path: UI survey taps → same payload mobile sends → live API.
 * Requires API at http://localhost:3001/api
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SurveyScreen } from '../src/screens/SurveyScreen';
import DataService from '../src/services/DataService';
import { normalizeSurveyAnswers, countAchievements } from '../src/utils/surveyAnswers';
import { runSurveyAsUser } from './helpers/runSurveyAsUser';
import { USER_PATHS, computeExpectedFromPath } from './helpers/surveyUserPaths';

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

describe('User flow: survey UI → API sync (real user path)', () => {
  const runId = `user-${Date.now()}`;
  let token;
  let userId;

  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('registers, completes survey via taps, syncs exact mobile payload to API', async () => {
    const path = USER_PATHS.ecoFriendly;
    const expected = computeExpectedFromPath(path);
    const mockReplace = jest.fn();

    const health = await fetch(`${API_BASE.replace('/api', '')}/api/health`);
    expect(health.ok).toBe(true);

    const email = `userflow-${runId}@waterapp.test`;
    const register = await api('/auth/register', {
      method: 'POST',
      body: { email, password: 'UserFlow123!', name: 'User Flow Test' },
    });
    expect(register.status).toBe(201);
    token = register.data.token;
    userId = register.data.userId;

    await DataService.setUserData({
      email,
      token,
      userId,
      isLoggedIn: true,
      surveyTaken: false,
    });

    render(<SurveyScreen navigation={{ replace: mockReplace }} />);
    await waitFor(() => expect(mockReplace).not.toHaveBeenCalled());
    await runSurveyAsUser(screen, path);

    await waitFor(() => expect(mockReplace).toHaveBeenCalled());

    const answers = await DataService.getSurveyAnswersInit();
    const initial = await DataService.InitialWaterFootPrint();
    expect(initial).toBe(expected.initial);

    const normalized = normalizeSurveyAnswers(answers);
    const profile = await api('/waterprint/initial-profile', {
      method: 'POST',
      token,
      body: {
        initialWaterprint: initial,
        answers: normalized,
        correctAnswersCount: countAchievements(normalized),
      },
    });
    expect(profile.status).toBe(201);

    const progress = await api(`/waterprint/progress/${userId}`, { token });
    expect(progress.status).toBe(200);
    expect(progress.data.initialWaterprint).toBe(expected.initial);
    // API sets current = initial on profile create (same as SurveyResultsScreen sync)
    expect(progress.data.currentWaterprint).toBe(expected.initial);

    const localCurrent = await DataService.getCurrentWaterFootprint();
    expect(localCurrent).toBe(expected.current);
  });
});
