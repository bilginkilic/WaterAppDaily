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
import { StorageService } from '../services';

export const SurveyScreen = ({ navigation }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
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

    const newAnswers = [...answers, { 
      questionId: questions[currentQuestion].id, 
      answer: option,
      type: option.type
    }];
    setAnswers(newAnswers);

    // Calculate new water footprint - only if type exists
    const previousWaterFootprint = surveyResults.totalWaterFootprint;
    const additionalWaterUsage = option.type ? (option.valueTotal || 0) : 0;
    const waterFootprint = previousWaterFootprint + additionalWaterUsage;

    console.log('\nWater Footprint Calculation:');
    console.log('Previous Total:', previousWaterFootprint, 'L');
    console.log('Additional Usage:', additionalWaterUsage, 'L');
    console.log('New Total:', waterFootprint, 'L');

    // Create new task or achievement only if type exists
    let newItem = null;
    if (option.type && option.type !== 'null') {
      newItem = {
        id: questions[currentQuestion].id,
        category: option.category || questions[currentQuestion].category,
        description: option.text,
        waterUsage: option.valueTotal || 0,
        type: option.type,
        date: new Date().toISOString()
      };
      console.log(`\nCreating new ${option.type}:`, newItem);
    }

    const newResults = {
      totalWaterFootprint: waterFootprint,
      tasks: newItem && newItem.type === 'Task' ? 
        [...surveyResults.tasks, newItem] : 
        surveyResults.tasks,
      achievements: newItem && newItem.type === 'Achievement' ? 
        [...surveyResults.achievements, newItem] : 
        surveyResults.achievements
    };

    console.log('\nCurrent Survey Status:');
    console.log('Total Water Footprint:', waterFootprint, 'L');
    console.log('Total Tasks:', newResults.tasks.length);
    console.log('Total Achievements:', newResults.achievements.length);
    console.log('Question Progress:', `${currentQuestion + 1}/${questions.length}`);
    console.log('===============================\n');

    setSurveyResults(newResults);
    await StorageService.saveSurveyResults(newResults);

    if (currentQuestion + 1 < questions.length) {
      // Skip car washing question if user doesn't have a car
      if (questions[currentQuestion].id === 9 && option.text === 'No') {
        setCurrentQuestion(prev => prev + 2); // Skip next question
      } else {
        setCurrentQuestion(prev => prev + 1);
      }
    } else {
      handleSurveyComplete();
    }
  };

  const handleSurveyComplete = async () => {
    try {
      // Calculate correct answers count (same as achievements count)
      const correctAnswersCount = surveyResults.achievements.length;

      // Format answers for API
      const formattedAnswers = answers.map(answer => ({
        questionId: answer.questionId,
        answer: answer.answer.text,
        isCorrect: answer.answer.type === 'Achievement'
      }));

      console.log('\n=== SURVEY COMPLETED ===');
      console.log('Final Water Footprint:', surveyResults.totalWaterFootprint, 'L');
      console.log('Total Tasks Created:', surveyResults.tasks.length);
      console.log('Total Achievements:', surveyResults.achievements.length);
      console.log('Correct Answers Count:', correctAnswersCount);
      console.log('Formatted Answers:', formattedAnswers);
      console.log('=======================\n');

      // Get improvement areas from tasks
      const improvementAreas = surveyResults.tasks.reduce((acc, task) => {
        if (task.category && !acc.includes(task.category)) {
          acc.push(task.category);
        }
        return acc;
      }, []);

      // Save initial survey data
      await StorageService.saveInitialSurvey({
        answers: formattedAnswers,
        correctAnswersCount,
        totalWaterFootprint: surveyResults.totalWaterFootprint,
        tasks: surveyResults.tasks,
        achievements: surveyResults.achievements
      });

      // Save survey results
      await StorageService.saveSurveyResults(surveyResults);

      // Navigate to results screen with all required data
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'SurveyResults',
            params: {
              results: {
                tasks: surveyResults.tasks,
                achievements: surveyResults.achievements,
                totalWaterFootprint: surveyResults.totalWaterFootprint,
                improvementAreas,
                answers: formattedAnswers,
                correctAnswersCount
              }
            }
          }
        ]
      });
    } catch (error) {
      console.error('Error completing survey:', error);
      Alert.alert(
        'Error',
        'Failed to complete survey. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => handleSurveyComplete()
          },
          {
            text: 'Cancel',
            onPress: () => navigation.goBack(),
            style: 'cancel'
          }
        ]
      );
    }
  };

  useEffect(() => {
    const initializeSurvey = async () => {
      // Clear all previous results
      await StorageService.clearStorage();
      
      // Reset all state
      setCurrentQuestion(0);
      setAnswers([]);
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