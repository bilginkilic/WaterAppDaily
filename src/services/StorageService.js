import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  async saveProgress(progress) {
    try {
      await AsyncStorage.setItem('progress', JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  async getProgress() {
    try {
      const progress = await AsyncStorage.getItem('progress');
      return progress ? JSON.parse(progress) : null;
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  }

  async saveAchievements(achievements) {
    try {
      await AsyncStorage.setItem('achievements', JSON.stringify(achievements));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }

  async getAchievements() {
    try {
      const achievements = await AsyncStorage.getItem('achievements');
      return achievements ? JSON.parse(achievements) : null;
    } catch (error) {
      console.error('Error getting achievements:', error);
      return null;
    }
  }

  async saveSurveyResults(results) {
    try {
      await AsyncStorage.setItem('surveyResults', JSON.stringify(results));
    } catch (error) {
      console.error('Error saving survey results:', error);
    }
  }

  async getSurveyResults() {
    try {
      const results = await AsyncStorage.getItem('surveyResults');
      return results ? JSON.parse(results) : null;
    } catch (error) {
      console.error('Error getting survey results:', error);
      return null;
    }
  }

  async saveInitialSurvey(surveyData) {
    try {
      await AsyncStorage.setItem('initialSurvey', JSON.stringify(surveyData));
    } catch (error) {
      console.error('Error saving initial survey:', error);
    }
  }

  async getInitialSurvey() {
    try {
      const surveyData = await AsyncStorage.getItem('initialSurvey');
      return surveyData ? JSON.parse(surveyData) : null;
    } catch (error) {
      console.error('Error getting initial survey:', error);
      return null;
    }
  }

  async savePastChallenge(challenge) {
    try {
      const pastChallenges = await this.getPastChallenges();
      await AsyncStorage.setItem('pastChallenges', 
        JSON.stringify([...pastChallenges, challenge]));
    } catch (error) {
      console.error('Error saving past challenge:', error);
    }
  }

  async getPastChallenges() {
    try {
      const challenges = await AsyncStorage.getItem('pastChallenges');
      return challenges ? JSON.parse(challenges) : [];
    } catch (error) {
      console.error('Error getting past challenges:', error);
      return [];
    }
  }

  async clearCurrentProgress() {
    try {
      await AsyncStorage.removeItem('progress');
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  }

  async clearAllData() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  calculateWaterFootprint(surveyData) {
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
}

export default new StorageService(); 