import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from './StorageService';

const STORAGE_KEYS = {
  USER_DATA: '@user_data',
  SURVEY_ANSWERS: '@survey_answers',
  TASKS: '@tasks',
  ACHIEVEMENTS: '@achievements',
  SURVEY_COMPLETED: '@survey_completed',
  WATER_FOOTPRINT: '@water_footprint',
  SURVEY_ANSWERS_INIT: '@survey_answers_init'
};

class DataService {
  static async setUserData(userData) {
    try {
      console.log('Setting user data:', userData);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  static async getUserData() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      console.log('Getting user data:', data ? JSON.parse(data) : null);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  static async isSurveyCompleted() {
    try {
      const userData = await this.getUserData();
      const completed = userData?.surveyTaken || false;
      console.log('Survey completion status:', completed);
      return completed;
    } catch (error) {
      console.error('Error checking survey completion:', error);
      return false;
    }
  }

  static async markSurveyCompleted() {
    try {
      const userData = await this.getUserData();
      if (userData) {
        userData.surveyTaken = true;
        await this.setUserData(userData);
        console.log('Survey marked as completed');
      }
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
      console.log('Survey answer saved:', answer);

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
      console.log('Task added:', task);
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
      console.log('Achievement added:', achievement);
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
      console.log('Water footprint updated:', { current: currentFootprint, new: newFootprint });
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
      console.log('Clearing all data...');
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
      console.log('All data cleared successfully');
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

  static async createInitialProfile(data) {
    try {
      const userData = await this.getUserData();
      if (!userData || !userData.token) {
        throw new Error('User not authenticated');
      }

      // Call the API service
      const response = await StorageService.createInitialProfile(userData.token, data);
      
      // Save the initial water footprint locally
      await AsyncStorage.setItem(STORAGE_KEYS.WATER_FOOTPRINT, data.initialWaterprint.toString());
      
      console.log('Initial profile created:', response);
      return response;
    } catch (error) {
      console.error('Error creating initial profile:', error);
      throw error;
    }
  }

  static async saveSurveyAnswersInit(answer) {
    try {
      const answers = await this.getSurveyAnswersInit() || [];
      answers.push({
        ...answer,
        timestamp: new Date().toISOString()
      });
      await AsyncStorage.setItem(STORAGE_KEYS.SURVEY_ANSWERS_INIT, JSON.stringify(answers));
      console.log('Survey answer init saved:', answer);
    } catch (error) {
      console.error('Error saving survey answer init:', error);
      throw error;
    }
  }

  static async getSurveyAnswersInit() {
    try {
      const answers = await AsyncStorage.getItem(STORAGE_KEYS.SURVEY_ANSWERS_INIT);
      return answers ? JSON.parse(answers) : [];
    } catch (error) {
      console.error('Error getting survey answers init:', error);
      throw error;
    }
  }

  static async InitialWaterFootPrint() {
    try {
      const answers = await this.getSurveyAnswersInit();
      const totalWaterFootprint = answers.reduce((sum, answer) => {
        return sum + (answer.valueTotal || 0);
      }, 0);
      console.log('Initial water footprint calculated:', totalWaterFootprint);
      return totalWaterFootprint;
    } catch (error) {
      console.error('Error calculating initial water footprint:', error);
      return 0;
    }
  }

  static async CurrentWaterFootPrint() {
    try {
      const tasks = await this.getTasks();
      const achievements = await this.getAchievements();
      const allItems = [...tasks, ...achievements];
      
      const currentWaterFootprint = allItems.reduce((sum, item) => {
        return sum + (item.valueTotal || 0);
      }, 0);
      
      console.log('Current water footprint calculated:', currentWaterFootprint);
      return currentWaterFootprint;
    } catch (error) {
      console.error('Error calculating current water footprint:', error);
      return 0;
    }
  }

  static async TaskToAchievements(task) {
    try {
      // Remove from tasks
      const tasks = await this.getTasks();
      const updatedTasks = tasks.filter(t => t.questionId !== task.questionId);
      await this.saveTasks(updatedTasks);

      // Add to achievements
      const achievements = await this.getAchievements();
      const newAchievement = {
        ...task,
        type: 'Achievement',
        timestamp: new Date().toISOString()
      };
      achievements.push(newAchievement);
      await StorageService.saveAchievements(achievements);

      console.log('Task converted to achievement:', newAchievement);
      return achievements;
    } catch (error) {
      console.error('Error converting task to achievement:', error);
      throw error;
    }
  }

  static async TakeChallenge() {
    try {
      const tasks = await this.getTasks();
      const achievements = await this.getAchievements();
      const waterFootprint = await this.CurrentWaterFootPrint();
      
      return {
        tasks,
        achievements,
        waterFootprint
      };
    } catch (error) {
      console.error('Error taking challenge:', error);
      throw error;
    }
  }
}

export default DataService; 