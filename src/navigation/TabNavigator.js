import React from 'react';
import { Platform, Text } from 'react-native';
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
        headerShown: false,
        tabBarStyle: {
          height: Platform.isPad ? 70 : 55,
          paddingBottom: Platform.isPad ? 20 : 7,
          paddingTop: Platform.isPad ? 10 : 7,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E3E3E3',
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
        tabBarAllowFontScaling: false,
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
          tabBarLabel: 'Tasks',
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
          tabBarLabel: 'Awards',
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
          tabBarLabel: 'Me',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}; 