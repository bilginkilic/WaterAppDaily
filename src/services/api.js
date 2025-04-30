import axios from 'axios';

const BASE_URL = 'https://waterappdashboard2.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data; // { userId: string, token: string, name: string }
  } catch (error) {
    console.error('Login API error:', error.response?.data || error.message);
    throw error;
  }
};

export const register = async (email, password, name) => {
  try {
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
    });
    return response.data; // { userId: string, token: string, message: string }
  } catch (error) {
    console.error('Register API error:', error.response?.data || error.message);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data; // { message: string }
  } catch (error) {
    console.error('Forgot password API error:', error.response?.data || error.message);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data; // { message: string }
  } catch (error) {
    console.error('Reset password API error:', error.response?.data || error.message);
    throw error;
  }
};

export const createInitialProfile = async (token, data) => {
  if (!token) {
    throw new Error('Authentication token is required');
  }

  try {
    const response = await fetch(`${BASE_URL}/waterprint/initial-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error - createInitialProfile:', error);
    throw error;
  }
};

export const updateWaterFootprint = async (token, data) => {
  if (!token) {
    throw new Error('Authentication token is required');
  }

  try {
    const response = await fetch(`${BASE_URL}/waterprint/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error - updateWaterFootprint:', error);
    throw error;
  }
};

export const getProgress = async (token, userId) => {
  if (!token) {
    throw new Error('Authentication token is required');
  }

  try {
    const response = await fetch(`${BASE_URL}/waterprint/progress/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error - getProgress:', error);
    throw error;
  }
};

// Interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // You might want to trigger a logout here
      console.log('Authentication error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default {
  login,
  register,
  forgotPassword,
  resetPassword,
  createInitialProfile,
  updateWaterFootprint,
  getProgress,
}; 