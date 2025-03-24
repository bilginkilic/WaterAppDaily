import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ChallengesScreen } from '../screens/ChallengesScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import strings from '../localization/strings';

const Tab = createBottomTabNavigator();

export const TabNavigator = ({ route }) => {
  const { screen = 'Challenges', improvementAreas = [], waterProfile = null } = route.params || {};
  
  console.log('TabNavigator params:', {
    screen,
    improvementAreas,
    waterProfile
  });

  return (
    <Tab.Navigator
      initialRouteName={screen}
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Challenges"
        component={ChallengesScreen}
        initialParams={{
          improvementAreas,
          waterProfile
        }}
        options={{
          tabBarLabel: 'Challenges',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="flag-checkered" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Achievements"
        component={AchievementsScreen}
        initialParams={{
          waterProfile
        }}
        options={{
          tabBarLabel: 'Achievements',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="trophy" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{
          waterProfile
        }}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}; 