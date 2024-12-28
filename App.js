import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from './src/screens/LoginScreen';
import { MainScreen } from './src/screens/MainScreen';
import { SurveyScreen } from './src/screens/SurveyScreen';
import { SurveyResultsScreen } from './src/screens/SurveyResultsScreen';
import { ChallengesScreen } from './src/screens/ChallengesScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="Survey" component={SurveyScreen} />
        <Stack.Screen name="SurveyResults" component={SurveyResultsScreen} />
        <Stack.Screen name="Challenges" component={ChallengesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App; 