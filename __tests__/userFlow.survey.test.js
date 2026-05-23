import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SurveyScreen } from '../src/screens/SurveyScreen';
import DataService from '../src/services/DataService';
import { runSurveyAsUser } from './helpers/runSurveyAsUser';
import {
  USER_PATHS,
  computeExpectedFromPath,
} from './helpers/surveyUserPaths';

describe('User flow: Survey (real taps)', () => {
  const mockReplace = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    mockReplace.mockClear();
  });

  it('eco-friendly user completes survey by tapping each answer', async () => {
    const path = USER_PATHS.ecoFriendly;
    const expected = computeExpectedFromPath(path);

    render(<SurveyScreen navigation={{ replace: mockReplace }} />);

    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/)).toBeTruthy();
    });

    await runSurveyAsUser(screen, path);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        'SurveyResults',
        expect.objectContaining({
          results: expect.objectContaining({
            totalWaterFootprint: expected.initial,
          }),
        })
      );
    });

    const initial = await DataService.InitialWaterFootPrint();
    const current = await DataService.getCurrentWaterFootprint();
    const tasks = await DataService.getTasks();
    const achievements = await DataService.getAchievements();

    expect(initial).toBe(expected.initial);
    expect(current).toBe(expected.current);
    expect(tasks).toHaveLength(expected.tasks.length);
    expect(achievements).toHaveLength(expected.achievements.length);
  });

  it('user who needs improvement gets task challenges from survey answers', async () => {
    const path = USER_PATHS.needsImprovement;
    const expected = computeExpectedFromPath(path);

    render(<SurveyScreen navigation={{ replace: mockReplace }} />);

    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/)).toBeTruthy();
    });

    await runSurveyAsUser(screen, path);

    await waitFor(() => expect(mockReplace).toHaveBeenCalled());

    const tasks = await DataService.getTasks();
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks).toHaveLength(expected.tasks.length);

    // First task from Q1 "No" — hand washing
    expect(tasks[0].questionId).toBe(1);
    expect(tasks[0].type).toBe('Task');
  });
});
