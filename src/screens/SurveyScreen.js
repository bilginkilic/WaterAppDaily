import React, { useState } from 'react';
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

export const SurveyScreen = ({ navigation }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [surveyResults, setSurveyResults] = useState({
    totalSaving: 0,
    totalUsage: 0,
    tasks: [],
    achievements: []
  });

  const handleAnswer = (option) => {
    const newAnswers = [...answers, { questionId: questions[currentQuestion].id, answer: option }];
    setAnswers(newAnswers);

    // Sonuçları hesapla
    if (option.valueSaving || option.valueTotal) {
      setSurveyResults(prev => ({
        totalSaving: prev.totalSaving + (option.valueSaving || 0),
        totalUsage: prev.totalUsage + (option.valueTotal || 0),
        tasks: option.type === 'Task' ? [
          ...prev.tasks, 
          {
            text: option.task,
            category: option.category
          }
        ] : prev.tasks,
        achievements: option.type === 'Achievement' ? [
          ...prev.achievements,
          {
            text: option.task,
            category: option.category
          }
        ] : prev.achievements
      }));
    }

    // Sonraki soruya geç veya sonuçları göster
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      navigation.navigate('SurveyResults', { results: surveyResults });
    }
  };

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