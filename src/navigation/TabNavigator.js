import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ChallengesScreen } from '../screens/ChallengesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import strings from '../localization/strings';

const Tab = createBottomTabNavigator();

export const TabNavigator = ({ route }) => {
  const { improvementAreas = [], screen } = route.params || {};

  console.log('TabNavigator - Improvement Areas:', improvementAreas);

  return (
    <Tab.Navigator
      initialRouteName={screen || 'Challenges'}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Challenges':
              iconName = 'water';
              break;
            case 'Achievements':
              iconName = 'trophy';
              break;
            case 'Profile':
              iconName = 'account';
              break;
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Challenges" 
        component={ChallengesScreen}
        initialParams={{ improvementAreas }}
        options={{ title: strings.challenges }}
      />
      <Tab.Screen 
        name="Achievements" 
        component={AchievementsScreen}
        options={{ title: strings.achievements }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        initialParams={{ improvementAreas }}
        options={{ 
          title: strings.profile,
        }}
      />
    </Tab.Navigator>
  );
}; 