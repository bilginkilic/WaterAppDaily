import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'tasks';
const ACHIEVEMENTS_KEY = 'achievements';
const WATER_PROFILE_KEY = 'userWaterProfile';

class StorageService {
  static async saveProgress(progress) {
    try {
      await AsyncStorage.setItem('progress', JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  static async getProgress() {
    try {
      const progress = await AsyncStorage.getItem('progress');
      return progress ? JSON.parse(progress) : null;
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  }

  static async getAchievements() {
    try {
      const achievements = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
      return achievements ? JSON.parse(achievements) : [];
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  static async saveAchievements(achievements) {
    try {
      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    } catch (error) {
      console.error('Error saving achievements:', error);
      throw error;
    }
  }

  static async getTasks() {
    try {
      const tasks = await AsyncStorage.getItem(TASKS_KEY);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  static async saveTasks(tasks) {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  }

  static async getWaterProfile() {
    try {
      const profile = await AsyncStorage.getItem(WATER_PROFILE_KEY);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting water profile:', error);
      return null;
    }
  }

  static async saveWaterProfile(profile) {
    try {
      await AsyncStorage.setItem(WATER_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving water profile:', error);
      throw error;
    }
  }

  static async clearStorage() {
    try {
      const keysToRemove = [
        TASKS_KEY,
        ACHIEVEMENTS_KEY,
        WATER_PROFILE_KEY,
        'progress',
        'surveyResults',
        'initialSurvey',
        'pastChallenges'
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
      console.log('All local storage cleared successfully');
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  static async saveSurveyResults(results) {
    try {
      await AsyncStorage.setItem('surveyResults', JSON.stringify(results));
    } catch (error) {
      console.error('Error saving survey results:', error);
    }
  }

  static async getSurveyResults() {
    try {
      const results = await AsyncStorage.getItem('surveyResults');
      return results ? JSON.parse(results) : null;
    } catch (error) {
      console.error('Error getting survey results:', error);
      return null;
    }
  }

  static calculateWaterFootprint(surveyData) {
    if (!surveyData) return 0;

    let totalUsage = 0;

    // Duş kullanımı
    if (surveyData.shower) {
      totalUsage += surveyData.shower * 10; // Her duş için ortalama 10L
    }

    // Bulaşık yıkama
    if (surveyData.dishwashing) {
      totalUsage += surveyData.dishwashing * 15; // Her yıkama için ortalama 15L
    }

    // Çamaşır yıkama
    if (surveyData.laundry) {
      totalUsage += surveyData.laundry * 50; // Her yıkama için ortalama 50L
    }

    // Günlük kullanım
    if (surveyData.daily) {
      totalUsage += surveyData.daily * 5; // Günlük kullanım için ortalama 5L
    }

    return totalUsage;
  }

  static async saveInitialSurvey(surveyData) {
    try {
      await AsyncStorage.setItem('initialSurvey', JSON.stringify(surveyData));
    } catch (error) {
      console.error('Error saving initial survey:', error);
    }
  }

  static async getInitialSurvey() {
    try {
      const surveyData = await AsyncStorage.getItem('initialSurvey');
      return surveyData ? JSON.parse(surveyData) : null;
    } catch (error) {
      console.error('Error getting initial survey:', error);
      return null;
    }
  }

  static async savePastChallenge(challenge) {
    try {
      const pastChallenges = await this.getPastChallenges();
      await AsyncStorage.setItem('pastChallenges', 
        JSON.stringify([...pastChallenges, challenge]));
    } catch (error) {
      console.error('Error saving past challenge:', error);
    }
  }

  static async getPastChallenges() {
    try {
      const challenges = await AsyncStorage.getItem('pastChallenges');
      return challenges ? JSON.parse(challenges) : [];
    } catch (error) {
      console.error('Error getting past challenges:', error);
      return [];
    }
  }

  static async clearCurrentProgress() {
    try {
      await AsyncStorage.removeItem('progress');
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  }

  static async clearAllData() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}

export default StorageService; 