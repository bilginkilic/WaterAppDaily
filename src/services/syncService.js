import DataService from './DataService';
import { apiRequest, TOKEN_EXPIRED } from './apiClient';
import { normalizeSurveyAnswers, countAchievements } from '../utils/surveyAnswers';

/**
 * Push local survey/footprint data to API so the admin dashboard can display it.
 */
export async function syncProfileToServer() {
  const userData = await DataService.getUserData();
  if (!userData?.token || !userData?.userId) {
    return { synced: false, reason: 'not_authenticated' };
  }

  const surveyCompleted = await DataService.isSurveyCompleted();
  if (!surveyCompleted) {
    return { synced: false, reason: 'survey_not_completed' };
  }

  const initial = await DataService.InitialWaterFootPrint();
  if (!initial) {
    return { synced: false, reason: 'no_local_footprint' };
  }

  const current = await DataService.getCurrentWaterFootprint();
  const answers = normalizeSurveyAnswers(
    (await DataService.getSurveyAnswersInit()) || []
  );

  try {
    await apiRequest('/waterprint/sync', {
      method: 'POST',
      token: userData.token,
      body: {
        initialWaterprint: initial,
        currentWaterprint: current,
        answers,
        correctAnswersCount: countAchievements(answers),
      },
    });
    console.log('✅ Profile synced to server:', userData.email, initial, '→', current);
    return { synced: true };
  } catch (error) {
    if (error.message === TOKEN_EXPIRED) {
      throw error;
    }
    console.warn('Profile sync failed:', error.message);
    return { synced: false, reason: error.message };
  }
}
