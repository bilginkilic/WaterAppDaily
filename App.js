import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from './src/screens/LoginScreen';
import { SurveyScreen } from './src/screens/SurveyScreen';
import { SurveyResultsScreen } from './src/screens/SurveyResultsScreen';
import { ChallengesScreen } from './src/screens/ChallengesScreen';
import { TabNavigator } from './src/navigation/TabNavigator';
import NotificationService from './src/services/NotificationService';
import { IntroScreen } from './src/screens/IntroScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import strings from './src/localization/strings';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { isLoading, userToken } = useAuth();

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('userLanguage');
        if (savedLanguage) {
          strings.setLanguage(savedLanguage);
        } else {
          strings.setLanguage('en');
          await AsyncStorage.setItem('userLanguage', 'en');
        }
      } catch (error) {
        console.error('Language initialization error:', error);
        strings.setLanguage('en');
      }
    };

    initializeLanguage();
  }, []);

  useEffect(() => {
    // Günlük hatırlatmaları başlat
    NotificationService.scheduleReminderNotification(10, 0); // Sabah 10:00
    NotificationService.scheduleMotivationalNotification(18, 0); // Akşam 18:00
  }, []);

  if (isLoading) {
    // Burada bir loading ekranı gösterebilirsiniz
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
        initialRouteName={userToken ? "Main" : "Login"}
      >
        {!userToken ? (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Intro" component={IntroScreen} />
            <Stack.Screen name="Survey" component={SurveyScreen} />
            <Stack.Screen name="SurveyResults" component={SurveyResultsScreen} />
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Challenges" component={ChallengesScreen} />
          </>
        ) : (
          // App screens
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Challenges" component={ChallengesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 