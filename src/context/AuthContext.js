import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DataService from '../services/DataService';
import { setSessionExpiredHandler } from '../services/apiClient';
import { syncProfileToServer } from '../services/syncService';

const AuthContext = createContext(null);

async function persistAuthSession(token, user) {
  await Promise.all([
    AsyncStorage.setItem('userToken', token),
    AsyncStorage.setItem('userId', user.id),
    AsyncStorage.setItem('userName', user.name || ''),
    AsyncStorage.setItem('userEmail', user.email || ''),
  ]);

  const existing = (await DataService.getUserData()) || {};
  await DataService.setUserData({
    ...existing,
    token,
    userId: user.id,
    email: user.email || existing.email || '',
    name: user.name || existing.name || '',
    isLoggedIn: true,
  });
}

async function clearAuthSession() {
  await AsyncStorage.multiRemove(['userToken', 'userId', 'userName', 'userEmail']);
  await DataService.clearUserData();
}

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousData, setAnonymousData] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const handleSessionExpired = useCallback(async () => {
    console.log('🔐 Session expired — clearing auth');
    setSessionExpired(true);
    setUserToken(null);
    setUserData(null);
    await clearAuthSession();
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(handleSessionExpired);
    return () => setSessionExpiredHandler(null);
  }, [handleSessionExpired]);

  const validateToken = async (token) => {
    // Trust stored token on startup; API calls will surface 401 when invalid.
    return Boolean(token);
  };

  const checkAuthState = async () => {
    try {
      console.log('🔐 Checking authentication state...');

      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('userName');
      const userEmail = await AsyncStorage.getItem('userEmail');
      const anonymousFlag = await AsyncStorage.getItem('isAnonymous');
      const storedAnonymousData = await AsyncStorage.getItem('anonymousData');
      const storedUserData = await DataService.getUserData();

      const effectiveToken = token || storedUserData?.token;

      if (effectiveToken && (userId || storedUserData?.userId)) {
        const uid = userId || storedUserData.userId;
        const isValid = await validateToken(effectiveToken);
        if (!isValid) {
          await handleSessionExpired();
        } else {
          await persistAuthSession(effectiveToken, {
            id: uid,
            name: userName || storedUserData?.name || 'User',
            email: userEmail || storedUserData?.email || '',
          });
          setUserToken(effectiveToken);
          setUserData({
            id: uid,
            name: userName || storedUserData?.name || 'User',
            email: userEmail || storedUserData?.email || '',
          });
          setIsAnonymous(false);
          setSessionExpired(false);
          syncProfileToServer().catch(() => {});
        }
      } else if (anonymousFlag === 'true') {
        setIsAnonymous(true);
        if (storedAnonymousData) {
          setAnonymousData(JSON.parse(storedAnonymousData));
        }
      }
    } catch (error) {
      console.error('❌ Auth state check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  const signIn = async (token, user) => {
    try {
      if (!token || !user || !user.id) {
        throw new Error('Invalid login credentials');
      }

      await persistAuthSession(token, user);
      setUserToken(token);
      setUserData({
        id: user.id,
        name: user.name || 'User',
        email: user.email || '',
      });
      setSessionExpired(false);
      setIsAnonymous(false);
      syncProfileToServer().catch(() => {});
      return true;
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  };

  const startAnonymousSession = async () => {
    try {
      await DataService.prepareGuestSession();
      setIsAnonymous(true);
      setAnonymousData({
        surveyCompleted: false,
        waterFootprint: null,
        lastCalculation: null,
      });
      await AsyncStorage.setItem('isAnonymous', 'true');
    } catch (error) {
      console.error('❌ Anonymous session error:', error);
      throw error;
    }
  };

  const saveAnonymousData = async (data) => {
    try {
      setAnonymousData(data);
      await AsyncStorage.setItem('anonymousData', JSON.stringify(data));
    } catch (error) {
      console.error('❌ Save anonymous data error:', error);
      throw error;
    }
  };

  const convertToFullAccount = async (token, user) => {
    try {
      await signIn(token, user);
      setIsAnonymous(false);
      setAnonymousData(null);
      await AsyncStorage.removeItem('isAnonymous');
      await AsyncStorage.removeItem('anonymousData');
    } catch (error) {
      console.error('❌ Account conversion error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setUserToken(null);
      setUserData(null);
      setIsAnonymous(false);
      setAnonymousData(null);
      setSessionExpired(false);
      await clearAuthSession();
      await AsyncStorage.multiRemove(['isAnonymous', 'anonymousData']);
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        user: userData,
        token: userToken,
        signIn,
        signOut,
        isAnonymous,
        anonymousData,
        startAnonymousSession,
        saveAnonymousData,
        convertToFullAccount,
        sessionExpired,
        clearSessionExpired: () => setSessionExpired(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
