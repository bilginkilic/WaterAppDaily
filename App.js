import React, { useEffect, useState } from 'react';
import { Appearance, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from './src/screens/LoginScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { SurveyScreen } from './src/screens/SurveyScreen';
import { SurveyResultsScreen } from './src/screens/SurveyResultsScreen';
import { TabNavigator } from './src/navigation/TabNavigator';
import NotificationService from './src/services/NotificationService';
import { IntroScreen } from './src/screens/IntroScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import strings from './src/localization/strings';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import DataService from './src/services/DataService';

Appearance.setColorScheme('light');

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const AppStack = () => {
  const [isSurveyTaken, setIsSurveyTaken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSurveyStatus = async () => {
      try {
        await DataService.migrateSurveyCompletionFlag();
        const surveyStatus = await DataService.isSurveyCompleted();
        setIsSurveyTaken(surveyStatus);
      } catch (error) {
        console.error('Error checking survey status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSurveyStatus();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={isSurveyTaken ? 'TabNavigator' : 'Intro'}
    >
      {!isSurveyTaken ? (
        <>
          <Stack.Screen name="Intro" component={IntroScreen} />
          <Stack.Screen name="Survey" component={SurveyScreen} />
          <Stack.Screen name="SurveyResults" component={SurveyResultsScreen} />
          <Stack.Screen name="TabNavigator" component={TabNavigator} />
        </>
      ) : (
        <>
          <Stack.Screen name="TabNavigator" component={TabNavigator} />
          <Stack.Screen name="Survey" component={SurveyScreen} />
          <Stack.Screen name="SurveyResults" component={SurveyResultsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

function AppContent() {
  const { isLoading: authLoading, token, isAnonymous, sessionExpired, clearSessionExpired } =
    useAuth();
  const navigationRef = React.useRef(null);
  const [boot, setBoot] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await DataService.migrateSurveyCompletionFlag();
        const [introSeen, surveyCompleted] = await Promise.all([
          DataService.hasSeenIntro(),
          DataService.isSurveyCompleted(),
        ]);

        const savedLanguage = await AsyncStorage.getItem('userLanguage');
        if (savedLanguage) {
          strings.setLanguage(savedLanguage);
        } else {
          strings.setLanguage('en');
          await AsyncStorage.setItem('userLanguage', 'en');
        }

        setBoot({ introSeen, surveyCompleted });
      } catch (error) {
        console.error('Initialization error:', error);
        setBoot({ introSeen: false, surveyCompleted: false });
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (token) {
      NotificationService.scheduleReminderNotification(10, 0);
      NotificationService.scheduleMotivationalNotification(18, 0);
    }
  }, [token]);

  useEffect(() => {
    if (sessionExpired && navigationRef.current) {
      clearSessionExpired();
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Auth', params: { screen: 'Login' } }],
      });
    }
  }, [sessionExpired, clearSessionExpired]);

  if (authLoading || !boot) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F0F9FF',
        }}
      >
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  const canEnterMainApp = boot.surveyCompleted && (token || isAnonymous);

  const rootInitialRoute = canEnterMainApp
    ? 'MainApp'
    : !boot.introSeen
      ? 'Intro'
      : token
        ? 'MainApp'
        : 'Auth';

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        key={rootInitialRoute}
        screenOptions={{ headerShown: false }}
        initialRouteName={rootInitialRoute}
      >
        {!boot.introSeen && !boot.surveyCompleted && (
          <Stack.Screen
            name="Intro"
            component={IntroScreen}
            options={{ gestureEnabled: false }}
          />
        )}
        <Stack.Screen name="Survey" component={SurveyScreen} />
        <Stack.Screen name="SurveyResults" component={SurveyResultsScreen} />
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="MainApp" component={AppStack} />
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
