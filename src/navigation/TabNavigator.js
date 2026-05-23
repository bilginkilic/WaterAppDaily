import React from 'react';
import { ChallengesScreen } from '../screens/ChallengesScreen';

/**
 * Main app shell — Tasks/Awards/Me switching lives in ChallengesScreen (top segment).
 */
export const TabNavigator = ({ route, navigation }) => {
  const nestedParams = route.params?.params || route.params || {};
  const { improvementAreas = [], waterProfile = null } = nestedParams;

  return (
    <ChallengesScreen
      navigation={navigation}
      route={{
        params: {
          improvementAreas,
          waterProfile,
        },
      }}
    />
  );
};
