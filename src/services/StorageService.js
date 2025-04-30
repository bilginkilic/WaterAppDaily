import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://waterappdashboard2.onrender.com/api';
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
      const parsedAchievements = achievements ? JSON.parse(achievements) : [];
      console.log('Retrieved achievements:', parsedAchievements);
      return parsedAchievements;
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  static async updateAPI(data) {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/waterprint/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API update failed');
      }

      const responseData = await response.json();
      console.log('API update successful:', responseData);
      return responseData;
    } catch (error) {
      console.error('API update error:', error);
      // API hatası olsa bile local storage'a kaydetmeye devam et
      return null;
    }
  }

  static async saveAchievements(achievements) {
    try {
      if (!Array.isArray(achievements)) {
        console.error('Invalid achievements data:', achievements);
        throw new Error('Achievements must be an array');
      }

      console.log('Saving achievements:', achievements);
      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
      
      // API'yi güncelle
      await this.updateAPI({
        achievements: achievements,
        type: 'achievements'
      });
      
      // Verify the save was successful
      const savedAchievements = await this.getAchievements();
      console.log('Verified saved achievements:', savedAchievements);
      
      return true;
    } catch (error) {
      console.error('Error saving achievements:', error);
      // Local storage'a kaydetmeye çalış
      try {
        await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
      } catch (storageError) {
        console.error('Error saving to local storage:', storageError);
      }
      return false;
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
      
      // API'yi güncelle
      await this.updateAPI({
        waterProfile: profile,
        type: 'waterProfile'
      });
      
      return true;
    } catch (error) {
      console.error('Error saving water profile:', error);
      // Local storage'a kaydetmeye çalış
      try {
        await AsyncStorage.setItem(WATER_PROFILE_KEY, JSON.stringify(profile));
      } catch (storageError) {
        console.error('Error saving to local storage:', storageError);
      }
      return false;
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
      if (!results) {
        throw new Error('Invalid survey results data');
      }

      console.log('Saving survey results:', results);
      await AsyncStorage.setItem('surveyResults', JSON.stringify(results));
      
      // Verify the save was successful
      const savedResults = await this.getSurveyResults();
      console.log('Verified saved survey results:', savedResults);
      
      return true;
    } catch (error) {
      console.error('Error saving survey results:', error);
      throw error;
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
      if (!surveyData) {
        throw new Error('Invalid survey data');
      }

      console.log('Saving initial survey:', surveyData);
      await AsyncStorage.setItem('initialSurvey', JSON.stringify(surveyData));
      
      // Verify the save was successful
      const savedSurvey = await this.getInitialSurvey();
      console.log('Verified saved initial survey:', savedSurvey);
      
      return true;
    } catch (error) {
      console.error('Error saving initial survey:', error);
      throw error;
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

  static async initializeTasks() {
    try {
      const tasks = await this.getTasks();
      const { categories } = require('../data/categories');
      const validCategoryIds = Object.keys(categories);
      
      // Filter out tasks with invalid categories
      const validTasks = tasks.filter(task => {
        const isValid = validCategoryIds.includes(task.category);
        if (!isValid) {
          console.warn(`Removing task with invalid category: ${task.category}`);
        }
        return isValid;
      });

      if (validTasks.length !== tasks.length) {
        console.log('Some tasks had invalid categories and were removed');
        await this.saveTasks(validTasks);
      }

      return validTasks;
    } catch (error) {
      console.error('Error initializing tasks:', error);
      return [];
    }
  }

  static async validateAndUpdateTasks() {
    try {
      const tasks = await this.getTasks();
      const { categories } = require('../data/categories');
      const validCategoryIds = Object.keys(categories);
      
      let hasInvalidCategories = false;
      const updatedTasks = tasks.map(task => {
        if (!validCategoryIds.includes(task.category)) {
          console.warn(`Invalid category found: ${task.category}, updating to 'daily'`);
          hasInvalidCategories = true;
          return {
            ...task,
            category: 'daily'
          };
        }
        return task;
      });

      if (hasInvalidCategories) {
        console.log('Saving updated tasks with valid categories...');
        await this.saveTasks(updatedTasks);
      }

      return updatedTasks;
    } catch (error) {
      console.error('Error validating tasks:', error);
      return [];
    }
  }

  static async updateTaskProgress(updatedTask) {
    try {
      // Get all tasks
      const allTasks = await this.getTasks();
      
      // Find the index of the task to update
      const taskIndex = allTasks.findIndex(task => task.id === updatedTask.id);
      
      if (taskIndex === -1) {
        console.warn(`Task with id ${updatedTask.id} not found`);
        return false;
      }
      
      // Update the task
      allTasks[taskIndex] = updatedTask;
      
      // Save updated tasks
      await this.saveTasks(allTasks);
      console.log(`Task ${updatedTask.id} updated successfully`);
      return true;
    } catch (error) {
      console.error('Error updating task progress:', error);
      return false;
    }
  }

  static async getAnswers() {
    try {
      const answers = await AsyncStorage.getItem('answers');
      return answers ? JSON.parse(answers) : [];
    } catch (error) {
      console.error('Error getting answers:', error);
      return [];
    }
  }

  static async saveAnswers(answers) {
    try {
      await AsyncStorage.setItem('answers', JSON.stringify(answers));
    } catch (error) {
      console.error('Error saving answers:', error);
      throw error;
    }
  }

  static async ensureWaterProfile() {
    try {
      const profile = await this.getWaterProfile();
      if (!profile) {
        const defaultProfile = {
          initialWaterprint: 0,
          currentWaterprint: 0,
          totalReduction: 0,
          previousUsage: 0,
          additionalUsage: 0,
          lastUpdated: new Date().toISOString()
        };
        console.log('Creating default water profile:', defaultProfile);
        await this.saveWaterProfile(defaultProfile);
        return defaultProfile;
      }
      return profile;
    } catch (error) {
      console.error('Error ensuring water profile exists:', error);
      return {
        initialWaterprint: 0,
        currentWaterprint: 0,
        totalReduction: 0,
        previousUsage: 0,
        additionalUsage: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  static async getToken() {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  static async resetUserData() {
    try {
      // Log start of reset
      console.log('👋 Starting complete user data reset...');
      
      // Get all keys to see what we're deleting
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('Current keys in storage:', allKeys);
      
      // Clear all user-related data with expanded list of keys
      const keysToRemove = [
        TASKS_KEY,
        ACHIEVEMENTS_KEY,
        WATER_PROFILE_KEY,
        'answers',
        'progress',
        'surveyResults',
        'initialSurvey',
        'userToken',
        'userId',
        'userName',
        'userEmail',
        'pastChallenges',
        'token',
        'savedEmail' // Also remove saved email for complete reset
      ];
      
      console.log('🗑️ Removing these keys:', keysToRemove);
      await AsyncStorage.multiRemove(keysToRemove);
      
      // Verify keys were removed
      const remainingKeys = await AsyncStorage.getAllKeys();
      console.log('Remaining keys after reset:', remainingKeys);
      
      console.log('✅ All user data has been reset successfully');
      return true;
    } catch (error) {
      console.error('❌ Error resetting user data:', error);
      return false;
    }
  }

  // API Operations
  static async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      await AsyncStorage.setItem('userToken', data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async register(email, password, name) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async forgotPassword(email) {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password reset request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  static async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password reset failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
}

export default StorageService; 