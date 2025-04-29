import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Uygulama başladığında authentication durumunu kontrol et
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('🔐 Checking authentication state...');
      
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('userName');
      const userEmail = await AsyncStorage.getItem('userEmail');

      console.log('Found stored auth data:', { 
        token: token ? '✅ Token exists' : '❌ No token',
        userId: userId || '❌ No userId' 
      });

      if (token && userId) {
        console.log('✅ Valid auth data found, restoring session');
        setUserToken(token);
        setUserData({
          id: userId,
          name: userName || 'User',
          email: userEmail || ''
        });
      } else {
        console.log('❌ No valid auth data, user needs to log in');
      }
    } catch (error) {
      console.error('❌ Auth state check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (token, user) => {
    try {
      console.log('🔑 Starting sign in process with:', { 
        token: token ? '✅ Valid' : '❌ Invalid', 
        user: user || '❌ No user data'
      });

      if (!token || !user || !user.id) {
        console.error('❌ Invalid sign in data:', { token, user });
        throw new Error('Invalid login credentials');
      }

      // Save to AsyncStorage
      const storagePromises = [
        AsyncStorage.setItem('userToken', token),
        AsyncStorage.setItem('userId', user.id),
        AsyncStorage.setItem('userName', user.name || ''),
        AsyncStorage.setItem('userEmail', user.email || '')
      ];

      await Promise.all(storagePromises);
      console.log('✅ Auth data saved to AsyncStorage');

      // Update state
      setUserToken(token);
      setUserData({
        id: user.id,
        name: user.name || 'User',
        email: user.email || ''
      });

      console.log('✅ Auth state updated - User logged in');
      return true;
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      const keys = ['userToken', 'userId', 'userName', 'userEmail'];
      await AsyncStorage.multiRemove(keys);
      
      setUserToken(null);
      setUserData(null);
      console.log('✅ Sign out completed');
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