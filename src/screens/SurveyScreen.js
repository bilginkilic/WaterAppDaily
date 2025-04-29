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

export const SurveyScreen = ({ navigation }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [surveyResults, setSurveyResults] = useState({
    totalWaterFootprint: 0,
    tasks: [],
    achievements: []
  });

  const handleAnswer = async (option) => {
    console.log('\n=== PROCESSING NEW ANSWER ===');
    console.log('Question:', {
      id: questions[currentQuestion].id,
      text: questions[currentQuestion].text,
      category: questions[currentQuestion].category
    });
    console.log('Selected Option:', {
      text: option.text,
      type: option.type,
      waterUsage: option.valueTotal,
      category: option.category
    });

    // Save answer using DataService
    await DataService.saveSurveyAnswer(questions[currentQuestion].id, option);

    // Get updated data
    const waterFootprint = await DataService.getWaterFootprint();
    const tasks = await DataService.getTasks();
    const achievements = await DataService.getAchievements();

    const newResults = {
      totalWaterFootprint: waterFootprint,
      tasks,
      achievements
    };

    console.log('\nCurrent Survey Status:');
    console.log('Total Water Footprint:', waterFootprint, 'L');
    console.log('Total Tasks:', tasks.length);
    console.log('Total Achievements:', achievements.length);
    console.log('Question Progress:', `${currentQuestion + 1}/${questions.length}`);
    console.log('===============================\n');

    setSurveyResults(newResults);

    if (currentQuestion + 1 < questions.length) {
      // Araç sahipliği sorusu (id: 9) için özel mantık
      if (questions[currentQuestion].id === 9) {
        if (option.text === 'No') {
          // Araç yoksa survey'i bitir
          handleSurveyComplete();
        } else {
          // Araç varsa sonraki soruya geç
          setCurrentQuestion(prev => prev + 1);
        }
      } else {
        setCurrentQuestion(prev => prev + 1);
      }
    } else {
      handleSurveyComplete();
    }
  };

  const handleSurveyComplete = async () => {
    try {
      // Get all current data
      const currentWaterFootprint = await DataService.getWaterFootprint();
      const currentTasks = await DataService.getTasks();
      const currentAchievements = await DataService.getAchievements();
      const currentAnswers = await DataService.getSurveyAnswers();

      // Calculate potential monthly saving
      const potentialMonthlySaving = await DataService.calculatePotentialMonthlySaving();

      console.log('Survey Completion Data:', {
        waterFootprint: currentWaterFootprint,
        tasks: currentTasks,
        achievements: currentAchievements,
        potentialMonthlySaving
      });

      // Format survey results
      const formattedResults = {
        totalWaterFootprint: currentWaterFootprint,
        tasks: currentTasks,
        achievements: currentAchievements,
        answers: currentAnswers,
        potentialMonthlySaving: potentialMonthlySaving
      };

      // Save survey results
      await DataService.saveSurveyAnswers(formattedResults);
      await DataService.markSurveyCompleted();

      // Navigate to results screen
      navigation.replace('SurveyResults', { results: formattedResults });
    } catch (error) {
      console.error('Error completing survey:', error);
      Alert.alert('Error', 'Failed to complete survey. Please try again.');
    }
  };

  useEffect(() => {
    const initializeSurvey = async () => {
      // Clear all previous results
      await DataService.clearAllData();
      
      // Reset all state
      setCurrentQuestion(0);
      setSurveyResults({
        totalWaterFootprint: 0,
        tasks: [],
        achievements: []
      });

      console.log('\n=== STARTING NEW SURVEY ===');
      console.log('Initial Water Footprint:', 0, 'L');
      console.log('Initial Tasks:', 0);
      console.log('Initial Achievements:', 0);
      console.log('===========================\n');
    };

    initializeSurvey();
  }, []); // Run only once when component mounts

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