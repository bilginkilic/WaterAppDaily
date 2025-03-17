import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SURVEY_RESULTS: '@survey_results',
  ACHIEVEMENTS: '@achievements',
  PROGRESS: '@progress',
  USER_DATA: '@user_data',
  PAST_CHALLENGES: '@past_challenges',
};

// Hata kontrolü için wrapper fonksiyon
const safeStorage = {
  setItem: async (key, value) => {
    try {
      if (AsyncStorage) {
        await AsyncStorage.setItem(key, value);
      } else {
        console.warn('AsyncStorage not available');
      }
    } catch (error) {
      console.error('Storage Error:', error);
    }
  },
  getItem: async (key) => {
    try {
      if (AsyncStorage) {
        return await AsyncStorage.getItem(key);
      }
      console.warn('AsyncStorage not available');
      return null;
    } catch (error) {
      console.error('Storage Error:', error);
      return null;
    }
  },
  multiRemove: async (keys) => {
    try {
      if (AsyncStorage) {
        await AsyncStorage.multiRemove(keys);
      } else {
        console.warn('AsyncStorage not available');
      }
    } catch (error) {
      console.error('Storage Error:', error);
    }
  }
};

export const StorageService = {
  // Survey sonuçlarını kaydet
  saveSurveyResults: async (results) => {
    await safeStorage.setItem(STORAGE_KEYS.SURVEY_RESULTS, JSON.stringify(results));
  },

  // Survey sonuçlarını getir
  getSurveyResults: async () => {
    const results = await safeStorage.getItem(STORAGE_KEYS.SURVEY_RESULTS);
    return results ? JSON.parse(results) : null;
  },

  // Initial survey'i kaydet
  saveInitialSurvey: async (surveyData) => {
    await safeStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(surveyData));
  },

  // Initial survey'i getir
  getInitialSurvey: async () => {
    const surveyData = await safeStorage.getItem(STORAGE_KEYS.USER_DATA);
    return surveyData ? JSON.parse(surveyData) : null;
  },

  // Başarıları kaydet
  saveAchievements: async (achievements) => {
    await safeStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  },

  // Başarıları getir
  getAchievements: async () => {
    const achievements = await safeStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return achievements ? JSON.parse(achievements) : [];
  },

  // İlerlemeyi kaydet
  saveProgress: async (progress) => {
    await safeStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  },

  // İlerlemeyi getir
  getProgress: async () => {
    const progress = await safeStorage.getItem(STORAGE_KEYS.PROGRESS);
    return progress ? JSON.parse(progress) : {};
  },

  // Tüm verileri temizle
  clearAllData: async () => {
    await safeStorage.multiRemove([
      STORAGE_KEYS.SURVEY_RESULTS,
      STORAGE_KEYS.ACHIEVEMENTS,
      STORAGE_KEYS.PROGRESS,
      STORAGE_KEYS.USER_DATA,
    ]);
  },

  savePastChallenge: async (challenge) => {
    try {
      const pastChallenges = await StorageService.getPastChallenges() || [];
      pastChallenges.unshift(challenge); // En yeni challenge'ı başa ekle
      await AsyncStorage.setItem(STORAGE_KEYS.PAST_CHALLENGES, JSON.stringify(pastChallenges));
    } catch (error) {
      console.error('Error saving past challenge:', error);
    }
  },

  getPastChallenges: async () => {
    try {
      const challenges = await AsyncStorage.getItem(STORAGE_KEYS.PAST_CHALLENGES);
      return challenges ? JSON.parse(challenges) : [];
    } catch (error) {
      console.error('Error getting past challenges:', error);
      return [];
    }
  },

  clearCurrentProgress: async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PROGRESS,
        STORAGE_KEYS.ACHIEVEMENTS,
      ]);
    } catch (error) {
      console.error('Error clearing current progress:', error);
    }
  },

  resetAllData: async () => {
    try {
      await AsyncStorage.clear();
      console.log('All data has been reset');
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  },
}; 