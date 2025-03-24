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

const { width } = Dimensions.get('window');

const formatWaterVolume = (liters) => {
  if (liters >= 1000) {
    return `${(liters / 1000).toFixed(1)} m³`;
  }
  return `${Math.round(liters)} L`;
};

export const SurveyResultsScreen = ({ route, navigation }) => {
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
  
  // Debug logs
  console.log('Survey Results:', JSON.stringify(results, null, 2));
  console.log('Tasks:', tasks);
  console.log('Achievements:', achievements);
  console.log('Water Footprint:', waterFootprint);
  console.log('Potential Saving:', potentialSaving);
  console.log('Improvement Areas:', results.improvementAreas);
  console.log('Available Categories:', Object.keys(categories));
  
  // Validate improvement areas
  const validImprovementAreas = results.improvementAreas.filter(id => categories[id]);
  if (validImprovementAreas.length !== results.improvementAreas.length) {
    console.warn('Some improvement areas are invalid:', 
      results.improvementAreas.filter(id => !categories[id]));
  }
  
  const handleStartChallenge = async () => {
    try {
      // Clear all local storage first
      await StorageService.clearStorage();

      // Calculate total water usage and potential savings
      const totalWaterUsage = results.tasks.reduce((sum, task) => sum + task.waterUsage, 0);

      // Get improvement areas from both tasks and achievements
      const allItems = [...results.tasks, ...results.achievements];
      const improvementAreas = allItems.reduce((areas, item) => {
        if (item.category && !areas.includes(item.category)) {
          areas.push(item.category);
        }
        return areas;
      }, []);

      console.log('\n=== CREATING INITIAL PROFILE ===');
      console.log('Initial water footprint:', waterFootprint);
      console.log('Tasks:', results.tasks);
      console.log('Achievements:', results.achievements);
      console.log('Monthly potential saving:', totalWaterUsage);
      console.log('Improvement Areas:', improvementAreas);

      // Save initial data to local storage
      await StorageService.saveTasks(results.tasks);
      await StorageService.saveAchievements(results.achievements);
      await StorageService.saveWaterProfile({
        initialWaterprint: waterFootprint,
        dailyUsage: waterFootprint,
        lastUpdated: new Date().toISOString()
      });

      // Create initial profile data
      const profileData = {
        answers: results.answers,
        correctAnswersCount: results.correctAnswersCount,
        initialWaterprint: waterFootprint,
        dailyUsage: waterFootprint,
        tasks: results.tasks,
        achievements: results.achievements,
        categories: improvementAreas,
        potentialSaving: totalWaterUsage,
        challengeStartDate: new Date().toISOString()
      };

      // Get user token
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('User token not found');
      }

      // Send to API with proper error handling
      const response = await fetch('https://waterappdashboard2.onrender.com/api/waterprint/initial-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to create water footprint');
      }

      const responseData = await response.json();
      console.log('API Response:', responseData);

      // Navigate to challenges screen
      navigation.reset({
        index: 0,
        routes: [
          { 
            name: 'Challenges',
            params: {
              improvementAreas: improvementAreas,
              waterProfile: {
                initialWaterprint: waterFootprint,
                dailyUsage: waterFootprint,
                potentialSaving: totalWaterUsage
              }
            }
          }
        ],
      });

    } catch (error) {
      console.error('Error creating water footprint:', error);
      Alert.alert(
        'Error',
        'Failed to start the challenge. Please try again. ' + error.message
      );
    }
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

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your Monthly Water Usage Water Footprint</Text>
          <Text style={styles.amount}>{waterFootprint.toFixed(1)}L</Text>
          
          <View style={styles.savingContainer}>
            <Text style={styles.savingTitle}>Potential Monthly Saving</Text>
            <Text style={styles.savingAmount}>
              {potentialSaving.toFixed(1)}L
            </Text>
            <Text style={styles.savingNote}>Based on your tasks and improvements</Text>
          </View>
        </View>

        <View style={styles.areasContainer}>
          <Text style={styles.sectionTitle}>{strings.improvementAreasTitle}</Text>
          <Text style={styles.explanationText}>
            {strings.improvementAreasDesc}
          </Text>
          {results.improvementAreas.map((categoryId) => {
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

        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartChallenge}
        >
          <MaterialCommunityIcons name="flag-checkered" size={24} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.startButtonText}>{strings.startChallengeButton}</Text>
        </TouchableOpacity>
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
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  savingContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  savingTitle: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 8,
  },
  savingAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  savingNote: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 16,
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
  startButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  buttonIcon: {
    marginRight: 8,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
}); 