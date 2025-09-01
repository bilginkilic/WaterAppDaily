import DataService from './DataService';
//api storage
const API_URL = 'https://waterappdashboard2.onrender.com/api';

class StorageService {
  static async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      await DataService.setUserData({ 
        token: data.token, 
        userId: data.userId, 
        email,
        isLoggedIn: true,
        surveyTaken: false
      });
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async register(email, password, name) {
    try {
      console.log('Attempting registration with:', { email, name });
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();
      console.log('Registration response:', {
        status: response.status,
        ok: response.ok,
        data: data
      });
      
      // Check for email already exists error
      if (data?.error?.code === 'auth/email-already-exists' || 
          data?.data?.error?.code === 'auth/email-already-exists' ||
          (data?.error?.message && data.error.message.includes('already in use')) ||
          (data?.data?.error?.message && data.data.error.message.includes('already in use'))) {
        console.log('User already exists error detected in response');
        throw new Error('This email is already registered. Please use a different email address or login with your existing account.');
      }

      if (!response.ok) {
        console.log('Response not OK:', response.status, data);
        const errorMessage = data?.data?.error?.message || 
                           data?.error?.message || 
                           data?.message || 
                           'Registration failed';
        throw new Error(errorMessage);
      }

      console.log('Registration successful:', data);
      return data;
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      // If the error is our custom error about existing user, pass it through
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        throw error;
      }
      // For other errors, throw a generic error
      throw new Error('Registration failed. Please try again.');
    }
  }

  static async forgotPassword(email) {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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

  static async updateAPI(data) {
    try {
      const userData = await DataService.getUserData();
      if (!userData?.token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/waterprint/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
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
      return null;
    }
  }

  static async createInitialProfile(token, data) {
    try {
      const response = await fetch(`${API_URL}/waterprint/initial-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create initial profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating initial profile:', error);
      throw error;
    }
  }

  static async deleteAccount(userId) {
    try {
      const userData = await DataService.getUserData();
      if (!userData?.token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  static async updateWaterprint({ currentWaterprint, taskId, waterprintReduction }) {
    try {
      const userData = await DataService.getUserData();
      if (!userData?.token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/waterprint/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          currentWaterprint,
          taskId,
          waterprintReduction
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update waterprint');
      }

      const data = await response.json();
      console.log('Waterprint update successful:', data);
      return data;
    } catch (error) {
      console.error('Error updating waterprint:', error);
      throw error;
    }
  }
}

export default StorageService; 