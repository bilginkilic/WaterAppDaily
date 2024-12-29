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

const Stack = createNativeStackNavigator();

function App() {
  useEffect(() => {
    // Günlük hatırlatmaları başlat
    NotificationService.scheduleReminderNotification(10, 0); // Sabah 10:00
    NotificationService.scheduleMotivationalNotification(18, 0); // Akşam 18:00
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Survey" component={SurveyScreen} />
        <Stack.Screen name="SurveyResults" component={SurveyResultsScreen} />
        <Stack.Screen name="Challenges" component={ChallengesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App; 