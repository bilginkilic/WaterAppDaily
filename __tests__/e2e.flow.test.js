/**
 * End-to-end app flow against an in-memory fake of the Render API:
 * login → survey taps → results → start challenge (initial-profile + sync)
 * → complete a task (current drops, sync) → the server holds what the
 * dashboard will show. Also covers the offline and resume paths.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { SurveyScreen } from '../src/screens/SurveyScreen';
import { SurveyResultsScreen } from '../src/screens/SurveyResultsScreen';
import { ChallengesScreen } from '../src/screens/ChallengesScreen';
import StorageService from '../src/services/StorageService';
import DataService from '../src/services/DataService';
import questions from '../src/data/questions';
import { computePotentialSaving } from '../src/utils/waterFootprint';
import { runSurveyAsUser } from './helpers/runSurveyAsUser';
import { USER_PATHS, computeExpectedFromPath } from './helpers/surveyUserPaths';

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({ user: null, token: null, signOut: jest.fn() }),
}));

/** Minimal stand-in for the Express API: stores profiles like Firestore would. */
function createFakeApi() {
  const profiles = {};
  const calls = [];
  const json = (status, body) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });
  const fetchImpl = jest.fn((url, init = {}) => {
    const path = url.replace(/^.*\/api/, '');
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ path, method: init.method || 'GET', body });
    const auth = init.headers?.Authorization;
    if (path === '/auth/login') {
      return json(200, { token: `tok-${body.email}`, userId: `uid-${body.email}`, name: 'E2E' });
    }
    if (!auth) return json(401, { message: 'Unauthorized' });
    const userId = auth.replace('Bearer tok-', 'uid-');
    if (path === '/waterprint/initial-profile') {
      profiles[userId] = { initialWaterprint: body.initialWaterprint, currentWaterprint: body.initialWaterprint, answers: body.answers };
      return json(201, profiles[userId]);
    }
    if (path === '/waterprint/sync') {
      profiles[userId] = { ...profiles[userId], ...body };
      return json(200, profiles[userId]);
    }
    return json(404, { message: 'not found' });
  });
  return { fetchImpl, profiles, calls };
}

const navigation = () => ({ replace: jest.fn(), navigate: jest.fn(), getParent: () => null });

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

afterEach(() => {
  delete global.fetch;
});

it('logged-in user: survey → challenge → task completed → server has the dashboard values', async () => {
  const api = createFakeApi();
  global.fetch = api.fetchImpl;
  const path = USER_PATHS.needsImprovement;
  const expected = computeExpectedFromPath(path);

  await StorageService.login('e2e@waterapp.test', 'secret');
  const userId = 'uid-e2e@waterapp.test';

  const surveyNav = navigation();
  render(<SurveyScreen navigation={surveyNav} />);
  await runSurveyAsUser(screen, path);
  await waitFor(() => expect(surveyNav.replace).toHaveBeenCalledWith('SurveyResults', expect.anything()));
  const resultsParams = surveyNav.replace.mock.calls[0][1];
  expect(resultsParams.results.totalWaterFootprint).toBe(expected.initial);

  const resultsNav = navigation();
  render(<SurveyResultsScreen route={{ params: resultsParams }} navigation={resultsNav} />);
  expect(screen.getByText('Potential Savings')).toBeTruthy();
  fireEvent.press(screen.getByTestId('start-challenge'));
  await waitFor(() => expect(resultsNav.replace).toHaveBeenCalledWith('MainApp', expect.anything()));

  expect(api.profiles[userId].initialWaterprint).toBe(expected.initial);
  expect(api.profiles[userId].currentWaterprint).toBe(expected.initial);
  const syncCall = api.calls.find((c) => c.path === '/waterprint/sync');
  expect(syncCall.body.answers).toHaveLength(questions.length);
  expect(syncCall.body.answers[0]).toEqual(expect.objectContaining({
    questionId: 1, answer: path[0], valueTotal: expect.any(Number), type: 'Task',
  }));

  render(
    <NavigationContainer>
      <ChallengesScreen route={{ params: {} }} navigation={{}} />
    </NavigationContainer>
  );
  await waitFor(() => expect(screen.getByText('Your Challenges')).toBeTruthy());
  const question = questions[0];
  fireEvent.press(screen.getByText(question.text, { exact: false }));
  await waitFor(() => expect(screen.getByText('Select your answer:')).toBeTruthy());
  const achievement = question.options.find((o) => o.type === 'Achievement');
  fireEvent.press(screen.getByText(achievement.text));

  await waitFor(() =>
    expect(api.profiles[userId].currentWaterprint).toBe(expected.initial - achievement.valueSaving)
  );
  expect(api.profiles[userId].initialWaterprint).toBe(expected.initial);
  expect(await DataService.getCurrentWaterFootprint()).toBe(expected.initial - achievement.valueSaving);
});

it('guest user can "Continue Offline" and reach the challenges', async () => {
  const path = USER_PATHS.needsImprovement;
  const surveyNav = navigation();
  render(<SurveyScreen navigation={surveyNav} />);
  await runSurveyAsUser(screen, path);
  await waitFor(() => expect(surveyNav.replace).toHaveBeenCalled());

  const resultsNav = navigation();
  render(<SurveyResultsScreen route={{ params: surveyNav.replace.mock.calls[0][1] }} navigation={resultsNav} />);
  fireEvent.press(screen.getByTestId('start-challenge'));
  await waitFor(() => expect(Alert.alert).toHaveBeenCalled());

  const buttons = Alert.alert.mock.calls[0][2];
  const offline = buttons.find((b) => b.text === 'Continue Offline');
  await offline.onPress();

  expect(resultsNav.replace).toHaveBeenCalledWith('MainApp', expect.objectContaining({
    params: expect.objectContaining({
      screen: 'Challenges',
      params: expect.objectContaining({
        waterProfile: expect.objectContaining({ initialWaterprint: computeExpectedFromPath(path).initial }),
      }),
    }),
  }));
  expect(await DataService.isSurveyCompleted()).toBe(true);
});

it('resuming a half-finished survey continues where the user left off without double counting', async () => {
  const path = USER_PATHS.ecoFriendly;
  const expected = computeExpectedFromPath(path);

  const first = render(<SurveyScreen navigation={navigation()} />);
  await runSurveyAsUser(screen, path.slice(0, 3));
  await waitFor(() => expect(screen.getByText(questions[3].text)).toBeTruthy());
  first.unmount();

  const nav = navigation();
  render(<SurveyScreen navigation={nav} />);
  await waitFor(() => expect(screen.getByText(questions[3].text)).toBeTruthy());
  for (let i = 3; i < path.length; i += 1) {
    await waitFor(() => expect(screen.getByText(questions[i].text)).toBeTruthy());
    fireEvent.press(screen.getByText(path[i]));
  }
  await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('SurveyResults', expect.anything()));

  const answers = await DataService.getSurveyAnswersInit();
  expect(answers).toHaveLength(questions.length);
  expect(await DataService.InitialWaterFootPrint()).toBe(expected.initial);
});

it('answering the same question twice keeps one answer and one task', async () => {
  const q = questions[0];
  const task = q.options.find((o) => o.type === 'Task');
  const achievement = q.options.find((o) => o.type === 'Achievement');
  const base = { questionId: q.id, category: q.category };
  await DataService.saveSurveyAnswersInit({ ...base, answer: task.text, ...task });
  await DataService.saveSurveyAnswer({ ...base, answer: task.text, ...task });
  await DataService.saveSurveyAnswersInit({ ...base, answer: achievement.text, ...achievement });
  await DataService.saveSurveyAnswer({ ...base, answer: achievement.text, ...achievement });

  expect(await DataService.getSurveyAnswersInit()).toHaveLength(1);
  expect(await DataService.getTasks()).toHaveLength(0);
  expect(await DataService.getAchievements()).toHaveLength(1);
  expect(await DataService.InitialWaterFootPrint()).toBe(achievement.valueTotal);
});

it('results screen, profile and DataService agree on the potential saving', async () => {
  const expected = computeExpectedFromPath(USER_PATHS.needsImprovement);
  for (const t of expected.tasks) await DataService.addTask(t);
  const fromService = await DataService.calculatePotentialMonthlySaving();
  expect(fromService).toBe(computePotentialSaving(expected.tasks, questions));
  expect(fromService).toBeGreaterThan(0);
});
