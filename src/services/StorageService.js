import DataService from './DataService';
import { apiRequest, TOKEN_EXPIRED, API_URL } from './apiClient';
import { syncProfileToServer } from './syncService';

class StorageService {
  static async login(email, password) {
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      const existing = (await DataService.getUserData()) || {};
      const surveyTaken =
        existing.surveyTaken || (await DataService.isSurveyCompleted());

      await DataService.setUserData({
        ...existing,
        token: data.token,
        userId: data.userId,
        email,
        name: data.name || email.split('@')[0],
        isLoggedIn: true,
        surveyTaken,
      });
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (
        data?.error?.code === 'auth/email-already-exists' ||
        data?.data?.error?.code === 'auth/email-already-exists' ||
        (data?.error?.message && data.error.message.includes('already in use')) ||
        (data?.data?.error?.message && data.data.error.message.includes('already in use'))
      ) {
        throw new Error(
          'This email is already registered. Please use a different email address or login with your existing account.'
        );
      }

      if (!response.ok) {
        const errorMessage =
          data?.data?.error?.message ||
          data?.error?.message ||
          data?.message ||
          'Registration failed';
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        throw error;
      }
      console.error('Registration error:', error);
      throw new Error('Registration failed. Please try again.');
    }
  }

  static async forgotPassword(email) {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  }

  static async resetPassword(token, newPassword) {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
    });
  }

  static async updateAPI(data) {
    try {
      const userData = await DataService.getUserData();
      if (!userData?.token) {
        throw new Error('No token found');
      }
      return await apiRequest('/waterprint/update', {
        method: 'POST',
        token: userData.token,
        body: data,
      });
    } catch (error) {
      if (error.message === TOKEN_EXPIRED) {
        throw error;
      }
      console.error('API update error:', error);
      return null;
    }
  }

  static async createInitialProfile(token, data) {
    return apiRequest('/waterprint/initial-profile', {
      method: 'POST',
      token,
      body: data,
    });
  }

  static async deleteAccount(userId) {
    const userData = await DataService.getUserData();
    if (!userData?.token) {
      throw new Error('No token found');
    }
    return apiRequest('/auth/delete-account', {
      method: 'DELETE',
      token: userData.token,
      body: { userId },
    });
  }

  static async updateWaterprint({ currentWaterprint, taskId, waterprintReduction }) {
    const userData = await DataService.getUserData();
    if (!userData?.token) {
      throw new Error('No token found');
    }

    return apiRequest('/waterprint/update', {
      method: 'POST',
      token: userData.token,
      body: {
        currentWaterprint,
        taskId,
        waterprintReduction,
      },
    });
  }
}

export default StorageService;
