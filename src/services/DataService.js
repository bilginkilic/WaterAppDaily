import AsyncStorage from '@react-native-async-storage/async-storage';

class DataService {
  // Storage keys
  static STORAGE_KEYS = {
    USER_DATA: 'userData',
    SURVEY_ANSWERS: 'surveyAnswers',
    TASKS: 'tasks',
    ACHIEVEMENTS: 'achievements',
    WATER_FOOTPRINT: 'waterFootprint',
    SURVEY_COMPLETED: 'surveyCompleted'
  };

  // User data operations
  static async setUserData(email) {
    try {
      const userData = {
        email,
        loggedIn: true,
        surveyTaken: false,
        timestamp: new Date().toISOString()
      };
      await AsyncStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error setting user data:', error);
      return false;
    }
  }

  static async getUserData() {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Survey operations
  static async saveSurveyAnswer(questionId, answer) {
    try {
      const currentAnswers = await this.getSurveyAnswers();
      const newAnswer = {
        questionId,
        answer: answer.text,
        valueTotal: answer.valueTotal || 0,
        type: answer.type,
        valueSaving: answer.valueSaving || 0,
        timestamp: new Date().toISOString()
      };

      const updatedAnswers = [...(currentAnswers || []), newAnswer];
      await AsyncStorage.setItem(this.STORAGE_KEYS.SURVEY_ANSWERS, JSON.stringify(updatedAnswers));

      // Update tasks or achievements based on answer type
      if (answer.type === 'Task') {
        await this.addTask(newAnswer);
      } else if (answer.type === 'Achievement') {
        await this.addAchievement(newAnswer);
      }

      // Update water footprint
      await this.updateWaterFootprint();

      return true;
    } catch (error) {
      console.error('Error saving survey answer:', error);
      return false;
    }
  }

  static async getSurveyAnswers() {
    try {
      const answers = await AsyncStorage.getItem(this.STORAGE_KEYS.SURVEY_ANSWERS);
      return answers ? JSON.parse(answers) : [];
    } catch (error) {
      console.error('Error getting survey answers:', error);
      return [];
    }
  }

  // Task operations
  static async addTask(taskData) {
    try {
      const currentTasks = await this.getTasks();
      const newTask = {
        ...taskData,
        completed: false
      };
      const updatedTasks = [...currentTasks, newTask];
      await AsyncStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
      return true;
    } catch (error) {
      console.error('Error adding task:', error);
      return false;
    }
  }

  static async getTasks() {
    try {
      const tasks = await AsyncStorage.getItem(this.STORAGE_KEYS.TASKS);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  // Achievement operations
  static async addAchievement(achievementData) {
    try {
      const currentAchievements = await this.getAchievements();
      const newAchievement = {
        ...achievementData,
        completed: true
      };
      const updatedAchievements = [...currentAchievements, newAchievement];
      await AsyncStorage.setItem(this.STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(updatedAchievements));
      return true;
    } catch (error) {
      console.error('Error adding achievement:', error);
      return false;
    }
  }

  static async getAchievements() {
    try {
      const achievements = await AsyncStorage.getItem(this.STORAGE_KEYS.ACHIEVEMENTS);
      return achievements ? JSON.parse(achievements) : [];
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  // Water footprint operations
  static async updateWaterFootprint() {
    try {
      const answers = await this.getSurveyAnswers();
      const waterFootprint = answers.reduce((total, answer) => total + (answer.valueTotal || 0), 0);
      await AsyncStorage.setItem(this.STORAGE_KEYS.WATER_FOOTPRINT, JSON.stringify(waterFootprint));
      return waterFootprint;
    } catch (error) {
      console.error('Error updating water footprint:', error);
      return 0;
    }
  }

  static async getWaterFootprint() {
    try {
      const footprint = await AsyncStorage.getItem(this.STORAGE_KEYS.WATER_FOOTPRINT);
      return footprint ? JSON.parse(footprint) : 0;
    } catch (error) {
      console.error('Error getting water footprint:', error);
      return 0;
    }
  }

  // Survey completion status
  static async markSurveyCompleted() {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.SURVEY_COMPLETED, 'true');
      return true;
    } catch (error) {
      console.error('Error marking survey as completed:', error);
      return false;
    }
  }

  static async isSurveyCompleted() {
    try {
      const completed = await AsyncStorage.getItem(this.STORAGE_KEYS.SURVEY_COMPLETED);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking survey completion status:', error);
      return false;
    }
  }

  // Clear all data
  static async clearAllData() {
    try {
      await AsyncStorage.multiRemove(Object.values(this.STORAGE_KEYS));
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
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