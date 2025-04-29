import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import strings from '../localization/strings';
import { categories } from '../data/categories';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from '../services/StorageService';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const formatWaterVolume = (liters) => {
  if (liters >= 1000) {
    return `${(liters / 1000).toFixed(1)} m³`;
  }
  return `${Math.round(liters)} L`;
};

export const SurveyResultsScreen = ({ route, navigation }) => {
  const { signIn } = useAuth();
  const { results } = route.params;
  const waterFootprint = results?.totalWaterFootprint || 0;
  const tasks = results?.tasks || [];
  const achievements = results?.achievements || [];
  
  // Calculate potential savings from tasks with validation
  const potentialSaving = tasks.reduce((total, task) => {
    const waterUsage = task.waterUsage || 0;
    console.log(`Task ${task.id}: waterUsage = ${waterUsage}`);
    return total + waterUsage;
  }, 0);

  // Get improvement areas from tasks and achievements
  const allItems = [...tasks, ...achievements];
  const improvementAreas = allItems.reduce((areas, item) => {
    if (item.category && !areas.includes(item.category)) {
      areas.push(item.category);
    }
    return areas;
  }, []);

  // Create water profile object
  const waterProfile = {
    initialWaterprint: waterFootprint,
    dailyUsage: waterFootprint,
    tasks: tasks,
    achievements: achievements
  };
  
  // Debug logs
  console.log('Survey Results:', JSON.stringify(results, null, 2));
  console.log('Tasks:', tasks);
  console.log('Achievements:', achievements);
  console.log('Water Footprint:', waterFootprint);
  console.log('Potential Saving:', potentialSaving);
  console.log('Improvement Areas:', improvementAreas);
  
  const handleStartChallenge = async () => {
    try {
      // Get user email from storage
      const userEmail = await AsyncStorage.getItem('savedEmail');
      if (!userEmail) {
        throw new Error('User email not found');
      }

      // Sign in the user first
      await signIn({ email: userEmail });

      // Calculate initial water footprint from answers
      const answers = results?.answers || [];
      const initialWaterFootprint = answers.reduce((total, answer) => {
        return total + (answer.waterprintValue || 0);
      }, 0);

      // Create water profile object with calculated values
      const waterProfileData = {
        initialWaterprint: initialWaterFootprint,
        dailyUsage: initialWaterFootprint,
        lastUpdated: new Date().toISOString(),
        tasks: results.tasks,
        achievements: results.achievements
      };

      console.log('Saving water profile:', waterProfileData);

      // Save all data
      const saveResults = await Promise.all([
        StorageService.saveTasks(results.tasks),
        StorageService.saveAchievements(results.achievements),
        StorageService.saveWaterProfile(waterProfileData),
        StorageService.saveAnswers(answers)
      ]);

      // Check if any save operation failed
      if (saveResults.includes(false)) {
        console.warn('Some data could not be saved to API but continued with local storage');
      }

      // Mark survey as completed for this email
      await AsyncStorage.setItem(`survey_completed_${userEmail}`, 'true');

      // Navigate to challenges screen
      console.log('Starting challenges with params:', { 
        improvementAreas: [], 
        waterProfile: waterProfileData 
      });
      
      // After sign in, the navigation structure will change automatically
      // and the Challenges screen will be available
      navigation.replace('Challenges', {
        improvementAreas: [],
        waterProfile: waterProfileData
      });
    } catch (error) {
      console.error('Error starting challenge:', error);
      Alert.alert(
        'Error',
        'Could not start the challenge. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Login')
          }
        ]
      );
    }
  };

  const renderResults = () => {
    const { totalWaterFootprint, tasks, achievements, potentialMonthlySaving } = route.params.results;

    return (
      <View style={styles.resultsContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Initial Water Footprint</Text>
          <Text style={styles.waterFootprintValue}>{formatWaterVolume(totalWaterFootprint)}</Text>
          <Text style={styles.summarySubtitle}>per day</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Potential Monthly Savings</Text>
          <Text style={styles.savingsValue}>{formatWaterVolume(potentialMonthlySaving)}</Text>
          <Text style={styles.summarySubtitle}>if you complete all tasks</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="format-list-checks" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="trophy" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{achievements.length}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartChallenge}
        >
          <Text style={styles.startButtonText}>Start Your Water Saving Journey</Text>
          <MaterialCommunityIcons name="arrow-right" size={24} color="#FFF" style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.confettiContainer}>
            <MaterialCommunityIcons name="party-popper" size={32} color="#2196F3" />
          </View>
          <Text style={styles.title}>{strings.surveyComplete}</Text>
        </View>

        {renderResults()}

        <View style={styles.areasContainer}>
          <Text style={styles.sectionTitle}>{strings.improvementAreasTitle}</Text>
          <Text style={styles.explanationText}>
            {strings.improvementAreasDesc}
          </Text>
          {improvementAreas.map((categoryId) => {
            const category = categories[categoryId];
            if (!category) return null;

            const categoryColor = category.color || '#2196F3';
            const categoryIcon = category.icon || 'water';

            return (
              <View key={categoryId} style={styles.categoryCard}>
                <View style={[styles.categoryIcon, { backgroundColor: categoryColor }]}>
                  {typeof categoryIcon === 'function' ? (
                    <categoryIcon width={24} height={24} color="#FFF" />
                  ) : (
                    <MaterialCommunityIcons 
                      name={categoryIcon} 
                      size={24} 
                      color="#FFF" 
                    />
                  )}
                </View>
                <View style={styles.categoryContent}>
                  <Text style={styles.categoryTitle}>
                    {category.title || 'Category'}
                  </Text>
                  <Text style={styles.categoryDescription}>
                    {category.description || ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.challengeInfoContainer}>
          <MaterialCommunityIcons name="lightbulb-on" size={24} color="#1976D2" />
          <Text style={styles.challengeInfoText}>
            {strings.challengeInfo}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confettiContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultsContainer: {
    marginBottom: 32,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  waterFootprintValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  savingsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  startButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  areasContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  challengeInfoContainer: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  challengeInfoText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#1976D2',
    lineHeight: 24,
  },
}); 