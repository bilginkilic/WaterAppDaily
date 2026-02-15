import React from 'react';
import { ChallengesScreen } from '../screens/ChallengesScreen';

export const TabNavigator = ({ route, navigation }) => {
  const { screen = 'Challenges', improvementAreas = [], waterProfile = null } = route.params || {};
  
  return (
    <ChallengesScreen 
      route={{ 
        params: { 
          improvementAreas, 
          waterProfile 
        } 
      }} 
      navigation={navigation} 
    />
  );
};
