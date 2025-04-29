import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_DATA: '@user_data',
  SURVEY_ANSWERS: '@survey_answers',
  TASKS: '@tasks',
  ACHIEVEMENTS: '@achievements',
  SURVEY_COMPLETED: '@survey_completed',
  WATER_FOOTPRINT: '@water_footprint'
};

class DataService {
  static async setUserData(userData) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  static async getUserData() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  static async isSurveyCompleted() {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.SURVEY_COMPLETED);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking survey completion:', error);
      return false;
    }
  }

  static async markSurveyCompleted() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SURVEY_COMPLETED, 'true');
    } catch (error) {
      console.error('Error marking survey as completed:', error);
      throw error;
    }
  }

  static async saveSurveyAnswer(answer) {
    try {
      const answers = await this.getSurveyAnswers() || [];
      answers.push({
        ...answer,
        timestamp: new Date().toISOString()
      });
      await AsyncStorage.setItem(STORAGE_KEYS.SURVEY_ANSWERS, JSON.stringify(answers));

      // Update tasks or achievements based on answer type
      if (answer.type === 'Task') {
        await this.addTask(answer);
      } else if (answer.type === 'Achievement') {
        await this.addAchievement(answer);
      }

      // Update water footprint
      await this.updateWaterFootprint(answer.valueTotal);
    } catch (error) {
      console.error('Error saving survey answer:', error);
      throw error;
    }
  }

  static async getSurveyAnswers() {
    try {
      const answers = await AsyncStorage.getItem(STORAGE_KEYS.SURVEY_ANSWERS);
      return answers ? JSON.parse(answers) : [];
    } catch (error) {
      console.error('Error getting survey answers:', error);
      throw error;
    }
  }

  static async addTask(task) {
    try {
      const tasks = await this.getTasks() || [];
      tasks.push({
        ...task,
        timestamp: new Date().toISOString()
      });
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  static async getTasks() {
    try {
      const tasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }

  static async addAchievement(achievement) {
    try {
      const achievements = await this.getAchievements() || [];
      achievements.push({
        ...achievement,
        timestamp: new Date().toISOString()
      });
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch (error) {
      console.error('Error adding achievement:', error);
      throw error;
    }
  }

  static async getAchievements() {
    try {
      const achievements = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return achievements ? JSON.parse(achievements) : [];
    } catch (error) {
      console.error('Error getting achievements:', error);
      throw error;
    }
  }

  static async updateWaterFootprint(value) {
    try {
      const currentFootprint = await this.getWaterFootprint() || 0;
      const newFootprint = currentFootprint + value;
      await AsyncStorage.setItem(STORAGE_KEYS.WATER_FOOTPRINT, newFootprint.toString());
      return newFootprint;
    } catch (error) {
      console.error('Error updating water footprint:', error);
      throw error;
    }
  }

  static async getWaterFootprint() {
    try {
      const footprint = await AsyncStorage.getItem(STORAGE_KEYS.WATER_FOOTPRINT);
      return footprint ? parseFloat(footprint) : 0;
    } catch (error) {
      console.error('Error getting water footprint:', error);
      throw error;
    }
  }

  static async clearAllData() {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  static async calculatePotentialMonthlySaving() {
    try {
      const tasks = await this.getTasks();
      console.log('Tasks for saving calculation:', tasks);

      if (!tasks || tasks.length === 0) {
        console.log('No tasks found for saving calculation');
        return 0;
      }

      const totalSaving = tasks.reduce((sum, task) => {
        const saving = task.valueTotal || 0;
        console.log(`Task ${task.id}: valueSaving = ${saving}`);
        return sum + saving;
      }, 0);

      console.log('Total potential monthly saving:', totalSaving);
      return totalSaving;
    } catch (error) {
      console.error('Error calculating potential monthly saving:', error);
      return 0;
    }
  }
}

export default DataService; 