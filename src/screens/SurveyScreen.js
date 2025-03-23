import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import strings from '../localization/strings';
import questions from '../data/questions';
import { StorageService } from '../services';

export const SurveyScreen = ({ navigation }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [surveyResults, setSurveyResults] = useState({
    totalSaving: 0,
    totalUsage: 0,
    tasks: [],
    achievements: []
  });

  const handleAnswer = async (option) => {
    const newAnswers = [...answers, { questionId: questions[currentQuestion].id, answer: option }];
    setAnswers(newAnswers);

    if (option.valueSaving || option.valueTotal) {
      const newResults = {
        totalSaving: surveyResults.totalSaving + (option.valueSaving || 0),
        totalUsage: surveyResults.totalUsage + (option.valueTotal || 0),
        tasks: option.type === 'Task' ? [
          ...surveyResults.tasks, 
          { 
            text: option.task, 
            category: option.category?.toLowerCase(),
            date: new Date().toISOString()
          }
        ] : surveyResults.tasks,
        achievements: option.type === 'Achievement' ? [
          ...surveyResults.achievements, 
          { 
            text: option.task, 
            category: option.category,
            improvement: option.valueSaving || 0,
            date: new Date().toISOString(),
            type: 'Achievement'
          }
        ] : surveyResults.achievements
      };
      
      setSurveyResults(newResults);
      await StorageService.saveSurveyResults(newResults);

      if (option.type === 'Achievement') {
        const savedAchievements = await StorageService.getAchievements() || [];
        const newAchievement = {
          category: option.category,
          improvement: option.valueSaving || 0,
          message: option.task,
          date: new Date().toISOString(),
          type: 'Achievement'
        };
        await StorageService.saveAchievements([...savedAchievements, newAchievement]);
      }
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSurveyComplete();
    }
  };

  const handleSurveyComplete = async () => {
    try {
      await StorageService.saveInitialSurvey(answers);
      
      const totals = answers.reduce((acc, answer) => {
        const option = answer.answer;
        return {
          totalUsage: acc.totalUsage + (option.valueTotal || 0),
          totalSaving: acc.totalSaving + (option.valueSaving || 0),
          tasks: option.type === 'Task' ? [...acc.tasks, {
            text: option.task,
            category: option.category?.toLowerCase(),
            date: new Date().toISOString()
          }] : acc.tasks
        };
      }, { totalUsage: 0, totalSaving: 0, tasks: [] });

      const improvementAreas = totals.tasks.reduce((acc, task) => {
        if (task?.category && !acc.includes(task.category)) {
          acc.push(task.category);
        }
        return acc;
      }, []);

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'SurveyResults',
            params: {
              results: {
                tasks: totals.tasks,
                totalUsage: totals.totalUsage,
                totalSaving: totals.totalSaving,
                improvementAreas
              }
            }
          }
        ]
      });
    } catch (error) {
      console.error('Error saving survey:', error);
    }
  };

  useEffect(() => {
    const loadPreviousResults = async () => {
      const previousResults = await StorageService.getSurveyResults();
      if (previousResults) {
        setSurveyResults(previousResults);
      }
    };
    loadPreviousResults();
  }, []);

  const currentQ = questions[currentQuestion];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {strings.formatString(strings.questionProgress, currentQuestion + 1, questions.length)}
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