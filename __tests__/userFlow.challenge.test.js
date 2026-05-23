import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SurveyScreen } from '../src/screens/SurveyScreen';
import { SurveyResultsScreen } from '../src/screens/SurveyResultsScreen';
import { ChallengesScreen } from '../src/screens/ChallengesScreen';
import DataService from '../src/services/DataService';
import questions from '../src/data/questions';
import { runSurveyAsUser } from './helpers/runSurveyAsUser';
import {
  USER_PATHS,
  computeExpectedFromPath,
  getQuestionOption,
} from './helpers/surveyUserPaths';
import { computeCurrentFootprint } from '../src/utils/waterFootprint';

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'userflow@test.com', name: 'User Flow' },
    token: 'test-token',
    signOut: jest.fn(),
  }),
}));

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    createInitialProfile: jest.fn(() => Promise.resolve({ ok: true })),
    updateWaterprint: jest.fn(() => Promise.resolve({ newWaterprint: 500 })),
  },
}));

jest.mock('../src/services', () => ({
  NotificationService: {
    requestPermissions: jest.fn(),
    scheduleNotification: jest.fn(),
  },
}));

describe('User flow: Survey → Results → Challenge task', () => {
  const mockReplace = jest.fn();
  const mockNavigation = { replace: mockReplace, navigate: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    await DataService.setUserData({
      email: 'userflow@test.com',
      token: 'test-token',
      userId: 'user-1',
      isLoggedIn: true,
      surveyTaken: false,
    });
  });

  it('user completes survey, starts challenge, and completes a task like in the app', async () => {
    const path = USER_PATHS.needsImprovement;
    const expected = computeExpectedFromPath(path);

    // 1. Survey — user taps through all questions
    render(<SurveyScreen navigation={mockNavigation} />);
    await waitFor(() => expect(screen.getByText(/Question 1 of/)).toBeTruthy());
    await runSurveyAsUser(screen, path);

    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
    const surveyResultsParams = mockReplace.mock.calls[0][1];

    // 2. Results screen — user taps "Start challenge"
    render(
      <SurveyResultsScreen
        route={{ params: surveyResultsParams }}
        navigation={mockNavigation}
      />
    );

    fireEvent.press(screen.getByText('Start challenge'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        'MainApp',
        expect.objectContaining({
          screen: 'TabNavigator',
        })
      );
    });

    // 3. Challenges — user opens first task and picks achievement answer
    render(
      <NavigationContainer>
        <ChallengesScreen route={{ params: {} }} navigation={{}} />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(screen.getByText('Your Challenges')).toBeTruthy();
    });

    const firstTask = expected.tasks[0];
    const question = questions.find((q) => q.id === firstTask.questionId);
    expect(question).toBeTruthy();

    // Tap task card (contains question text)
    fireEvent.press(screen.getByText(question.text, { exact: false }));

    await waitFor(() => {
      expect(screen.getByText('Select your answer:')).toBeTruthy();
    });

    const achievementOption = question.options.find((o) => o.type === 'Achievement');
    fireEvent.press(screen.getByText(achievementOption.text));

    await waitFor(async () => {
      const tasks = await DataService.getTasks();
      expect(tasks.find((t) => t.questionId === firstTask.questionId)).toBeUndefined();
    });

    const achievements = await DataService.getAchievements();
    const completed = achievements.find((a) => a.questionId === firstTask.questionId);
    expect(completed).toBeTruthy();
    expect(completed.type).toBe('Achievement');

    const initial = await DataService.InitialWaterFootPrint();
    const current = await DataService.getCurrentWaterFootprint();
    expect(current).toBe(
      computeCurrentFootprint(initial, [
        { valueSaving: achievementOption.valueSaving, earnedViaChallenge: true },
      ])
    );
  });
});
