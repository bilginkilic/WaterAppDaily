import AsyncStorage from '@react-native-async-storage/async-storage';
import { computeCurrentFootprint, sumSurveyValueTotals } from '../utils/waterFootprint';

const STORAGE_KEYS = {
  USER_DATA: '@user_data',
  SURVEY_ANSWERS: '@survey_answers',
  TASKS: '@tasks',
  ACHIEVEMENTS: '@achievements',
  SURVEY_COMPLETED: '@survey_completed',
  WATER_FOOTPRINT: '@water_footprint',
  SURVEY_ANSWERS_INIT: '@survey_answers_init',
  INTRO_SEEN: '@intro_seen',
  LAST_MAIN_SEGMENT: '@last_main_segment',
};

class DataService {
  static async setIntroSeen(seen) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INTRO_SEEN, JSON.stringify(seen));
      console.log('Intro seen status saved:', seen);
    } catch (error) {
      console.error('Error saving intro seen status:', error);
      throw error;
    }
  }

  static async hasSeenIntro() {
    try {
      const seen = await AsyncStorage.getItem(STORAGE_KEYS.INTRO_SEEN);
      return seen ? JSON.parse(seen) : false;
    } catch (error) {
      console.error('Error getting intro seen status:', error);
      return false;
    }
  }

  static async getLastMainSegment() {
    try {
      const segment = await AsyncStorage.getItem(STORAGE_KEYS.LAST_MAIN_SEGMENT);
      return ['challenges', 'achievements', 'profile'].includes(segment)
        ? segment
        : 'challenges';
    } catch (error) {
      return 'challenges';
    }
  }

  static async setLastMainSegment(segment) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_MAIN_SEGMENT, segment);
    } catch (error) {
      console.error('Error saving last main segment:', error);
    }
  }
  
      
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
      const flag = await AsyncStorage.getItem(STORAGE_KEYS.SURVEY_COMPLETED);
      if (flag === 'true') {
        return true;
      }
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
      await AsyncStorage.setItem(STORAGE_KEYS.SURVEY_COMPLETED, 'true');
      const userData = (await this.getUserData()) || {};
      userData.surveyTaken = true;
      await this.setUserData(userData);
      console.log('Survey marked as completed');
    } catch (error) {
      console.error('Error marking survey completion:', error);
      throw error;
    }
  }

  /** Older builds did not persist @survey_completed — infer from saved progress. */
  static async migrateSurveyCompletionFlag() {
    try {
      const flag = await AsyncStorage.getItem(STORAGE_KEYS.SURVEY_COMPLETED);
      if (flag === 'true') {
        return true;
      }

      const [answersInit, tasks, userData] = await Promise.all([
        this.getSurveyAnswersInit(),
        this.getTasks(),
        this.getUserData(),
      ]);

      const hasProgress =
        (answersInit?.length ?? 0) > 0 ||
        (tasks?.length ?? 0) > 0 ||
        userData?.surveyTaken === true;

      if (hasProgress) {
        await AsyncStorage.setItem(STORAGE_KEYS.SURVEY_COMPLETED, 'true');
        if (userData && !userData.surveyTaken) {
          userData.surveyTaken = true;
          await this.setUserData(userData);
        }
        console.log('Migrated survey completion flag from existing progress');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error migrating survey completion flag:', error);
      return false;
    }
  }

  static async saveSurveyAnswer(answer) {
    try {
      const answers = await this.getSurveyAnswers() || [];
      const record = {
        ...answer,
        timestamp: answer.timestamp || new Date().toISOString(),
      };
      answers.push(record);
      await AsyncStorage.setItem(STORAGE_KEYS.SURVEY_ANSWERS, JSON.stringify(answers));
      console.log('Survey answer saved:', record);

      if (record.type === 'Task') {
        await this.addTask(record);
      } else if (record.type === 'Achievement') {
        await this.addAchievement(record);
      }

      const initial = await this.InitialWaterFootPrint();
      const achievements = await this.getAchievements();
      const current = computeCurrentFootprint(initial, achievements);
      await AsyncStorage.setItem(STORAGE_KEYS.WATER_FOOTPRINT, current.toString());
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

  static async syncWaterFootprintFromProgress() {
    try {
      const initial = await this.InitialWaterFootPrint();
      const achievements = await this.getAchievements();
      const current = computeCurrentFootprint(initial, achievements);
      await AsyncStorage.setItem(STORAGE_KEYS.WATER_FOOTPRINT, current.toString());
      return current;
    } catch (error) {
      console.error('Error syncing water footprint:', error);
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

  static async clearUserData() {
    try {
      console.log('🚪 Clearing user auth data (survey progress kept)...');
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      console.log('✅ User auth data cleared');
    } catch (error) {
      console.error('Error clearing user data:', error);
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

  static async clearSurveyData() {
    try {
      console.log('Clearing survey data...');
      const keysToRemove = [
        STORAGE_KEYS.SURVEY_ANSWERS,
        STORAGE_KEYS.TASKS,
        STORAGE_KEYS.ACHIEVEMENTS,
        STORAGE_KEYS.SURVEY_COMPLETED,
        STORAGE_KEYS.WATER_FOOTPRINT,
        STORAGE_KEYS.SURVEY_ANSWERS_INIT,
      ];
      await AsyncStorage.multiRemove(keysToRemove);
      console.log('Survey data cleared successfully');
    } catch (error) {
      console.error('Error clearing survey data:', error);
      throw error;
    }
  }

  /** Fresh local guest session — no login, new survey from scratch. */
  static async prepareGuestSession() {
    await this.clearSurveyData();
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_MAIN_SEGMENT);
    console.log('Prepared fresh guest session');
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
      //const response = await StorageService.createInitialProfile(userData.token, data);
      const response = true;
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
      const totalWaterFootprint = sumSurveyValueTotals(answers);
      console.log('Initial water footprint calculated:', totalWaterFootprint);
      return totalWaterFootprint;
    } catch (error) {
      console.error('Error calculating initial water footprint:', error);
      return 0;
    }
  }

  static async CurrentWaterFootPrint() {
    try {
      const initial = await this.InitialWaterFootPrint();
      const achievements = await this.getAchievements();
      const currentWaterFootprint = computeCurrentFootprint(initial, achievements);
      console.log('Current water footprint calculated:', currentWaterFootprint);
      return currentWaterFootprint;
    } catch (error) {
      console.error('Error calculating current water footprint:', error);
      return 0;
    }
  }

  static async getCurrentWaterFootprint() {
    return this.CurrentWaterFootPrint();
  }

  static async saveTasks(tasks) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      console.log('Tasks saved:', tasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  }

  static async saveAchievements(achievements) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
      console.log('achievements saved:', achievements);
    } catch (error) {
      console.error('Error saving achievements:', achievements);
      throw error;
    }
  }

  static async TaskToAchievements(task) {
    try {
      console.log('Converting task to achievement:', task);

      // Remove from tasks
      const tasks = await this.getTasks();
      const updatedTasks = tasks.filter(t => t.questionId !== task.questionId);
      await  this.saveTasks(updatedTasks);

      // Add to achievements
      const achievements = await this.getAchievements();
      const newAchievement = {
        ...task,
        type: 'Achievement',
        earnedViaChallenge: true,
        timestamp: new Date().toISOString(),
      };
      achievements.push(newAchievement);
      await this.saveAchievements(achievements);
      await this.syncWaterFootprintFromProgress();

      console.log('Task converted to achievement:', newAchievement);
      console.log('Updated achievements:', achievements);
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