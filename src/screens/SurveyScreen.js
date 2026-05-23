import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import strings from '../localization/strings';
import questions from '../data/questions';
import DataService from '../services/DataService';

export const SurveyScreen = ({ navigation, route = {} }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [surveyResults, setSurveyResults] = useState({
    totalWaterFootprint: 0,
    tasks: [],
    achievements: []
  });

  const handleAnswer = async (option) => {
    console.log('\n=== PROCESSING NEW ANSWER ===');
    const currentQ = questions[currentQuestion];
    
    // Prepare answer data
    const answer = {
      questionId: currentQ.id,
      answer: option.text,
      valueTotal: option.valueTotal || 0,
      type: option.type,
      valueSaving: option.valueSaving || 0,
      task: option.task || null,
      timestamp: new Date().toISOString(),
      category: currentQ.category,
    };

    console.log('Processing Answer:', {
      questionId: answer.questionId,
      answer: answer.answer,
      type: answer.type,
      valueTotal: answer.valueTotal,
      valueSaving: answer.valueSaving
    });

    try {
      // Save initial survey answer
      await DataService.saveSurveyAnswersInit(answer);
      
      // Also save to regular survey answers for backward compatibility
      await DataService.saveSurveyAnswer(answer);

      // Calculate initial water footprint
      const initialWaterFootprint = await DataService.InitialWaterFootPrint();
      console.log('Current Initial Water Footprint:', initialWaterFootprint);

      // Get updated data
      const tasks = await DataService.getTasks();
      const achievements = await DataService.getAchievements();

      console.log('\nCurrent Survey Status:');
      console.log('Initial Water Footprint:', initialWaterFootprint, 'L');
      console.log('Total Tasks:', tasks.length);
      console.log('Total Achievements:', achievements.length);
      console.log('Question Progress:', `${currentQuestion + 1}/${questions.length}`);

      // Update state with new results
      setSurveyResults({
        totalWaterFootprint: initialWaterFootprint,
        tasks,
        achievements
      });

      // Handle navigation logic
      if (currentQuestion + 1 < questions.length) {
        if (currentQ.id === 9 && option.text === 'No') {
          handleSurveyComplete();
        } else {
          setCurrentQuestion(prev => prev + 1);
        }
      } else {
        handleSurveyComplete();
      }
    } catch (error) {
      console.error('Error processing answer:', error);
      Alert.alert('Error', 'Failed to save your answer. Please try again.');
    }
  };

  const handleSurveyComplete = async () => {
    try {
      // Get initial water footprint from survey answers init
      const initialWaterFootprint = await DataService.InitialWaterFootPrint();
      const currentTasks = await DataService.getTasks();
      const currentAchievements = await DataService.getAchievements();
      const currentAnswers = await DataService.getSurveyAnswersInit();
      
      // Calculate potential monthly saving
      const potentialMonthlySaving = await DataService.calculatePotentialMonthlySaving();

      console.log('Survey Completion Data:', {
        initialWaterFootprint,
        tasks: currentTasks,
        achievements: currentAchievements,
        potentialMonthlySaving
      });

      await DataService.syncWaterFootprintFromProgress();
      await DataService.markSurveyCompleted();

      // Navigate to results screen with all data
      navigation.replace('SurveyResults', {
        results: {
          totalWaterFootprint: initialWaterFootprint,
          tasks: currentTasks,
          achievements: currentAchievements,
          answers: currentAnswers,
          potentialMonthlySaving: potentialMonthlySaving
        }
      });
    } catch (error) {
      console.error('Error completing survey:', error);
      Alert.alert('Error', 'Failed to complete survey. Please try again.');
    }
  };

  useEffect(() => {
    const initializeSurvey = async () => {
      const completed = await DataService.isSurveyCompleted();
      if (completed) {
        const parent = navigation.getParent();
        if (parent) {
          navigation.replace('TabNavigator');
        } else {
          navigation.replace('MainApp', { screen: 'TabNavigator' });
        }
        return;
      }

      const startFresh = route.params?.startFresh === true;
      const existingAnswers = await DataService.getSurveyAnswersInit();

      if (!startFresh && existingAnswers?.length > 0) {
        console.log('Resuming in-progress survey');
        return;
      }

      await DataService.clearSurveyData();

      setCurrentQuestion(0);
      setSurveyResults({
        totalWaterFootprint: 0,
        tasks: [],
        achievements: [],
      });

      console.log('\n=== STARTING NEW SURVEY ===');
    };

    initializeSurvey();
  }, [navigation, route?.params?.startFresh]);

  const currentQ = questions[currentQuestion];
  if (!currentQ || !currentQ.text) {
    console.error('Current question is undefined or missing text property');
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQ.text}</Text>
          {currentQ.trainingText && (
            <Text style={styles.trainingText}>{currentQ.trainingText}</Text>
          )}
        </View>

        <View style={styles.optionsContainer}>
          {currentQ.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleAnswer(option)}
              testID={`survey-q${currentQ.id}-opt-${index}`}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
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
  progressContainer: {
    marginBottom: 30,
  },
  progressText: {
    fontSize: 16,
    color: '#2196F3',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  questionContainer: {
    marginBottom: 30,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  trainingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
}); 