/**
 * Smoke: every screen and service module loads (catches broken imports that
 * only surface in a release bundle) and the key screens render.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({ user: null, token: null, signOut: jest.fn(), signIn: jest.fn() }),
}));

const MODULES = [
  '../src/services',
  '../src/services/DataService',
  '../src/services/StorageService',
  '../src/services/syncService',
  '../src/services/apiClient',
  '../src/services/TutorialService',
  '../src/utils/waterFootprint',
  '../src/utils/surveyAnswers',
  '../src/data/questions',
  '../src/data/questionsByCategory',
  '../src/screens/SurveyScreen',
  '../src/screens/SurveyResultsScreen',
  '../src/screens/ChallengesScreen',
  '../src/screens/AchievementsScreen',
  '../src/screens/ProfileScreen',
  '../src/screens/LoginScreen',
  '../src/screens/RegisterScreen',
  '../src/screens/ForgotPasswordScreen',
];

describe('smoke: modules load', () => {
  it.each(MODULES)('%s', (path) => {
    expect(() => require(path)).not.toThrow();
  });

  it('services barrel exposes the real services', () => {
    const services = require('../src/services');
    expect(services.DataService).toBeDefined();
    expect(services.StorageService).toBeDefined();
    expect(services.NotificationService).toBeDefined();
    expect(typeof services.syncProfileToServer).toBe('function');
  });

  it('production API URL is the Render service', () => {
    jest.isolateModules(() => {
      const prevDev = global.__DEV__;
      const prevUrl = process.env.API_URL;
      global.__DEV__ = false;
      delete process.env.API_URL;
      const { API_URL } = require('../src/services/apiClient');
      expect(API_URL).toBe('https://waterappdashboard2.onrender.com/api');
      global.__DEV__ = prevDev;
      if (prevUrl !== undefined) process.env.API_URL = prevUrl;
    });
  });
});

describe('smoke: screens render', () => {
  beforeEach(() => AsyncStorage.clear());

  it('SurveyScreen shows the first question', async () => {
    const { SurveyScreen } = require('../src/screens/SurveyScreen');
    const questions = require('../src/data/questions').default;
    render(<SurveyScreen navigation={{ replace: jest.fn(), getParent: () => null }} />);
    await waitFor(() => expect(screen.getByText(questions[0].text)).toBeTruthy());
    expect(screen.getByText(`Question 1 of ${questions.length}`)).toBeTruthy();
  });

  it('SurveyResultsScreen shows the potential saving', () => {
    const { SurveyResultsScreen } = require('../src/screens/SurveyResultsScreen');
    render(
      <SurveyResultsScreen
        navigation={{ replace: jest.fn() }}
        route={{ params: { results: {
          totalWaterFootprint: 126,
          tasks: [{ questionId: 1, answer: 'No', type: 'Task', valueTotal: 126, valueSaving: 0 }],
          achievements: [],
          answers: [],
        } } }}
      />
    );
    expect(screen.getByText('Potential Savings')).toBeTruthy();
  });
});
