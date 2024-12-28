import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { categories } from '../data/categories';
import questions from '../data/questions';
import strings from '../localization/strings';
import { questionsByCategory, getCategoryQuestionCount, getCategoryMaxSavings } from '../data/questionsByCategory';

const { width } = Dimensions.get('window');

const CategoryCard = ({ category, isActive, hasQuestions, onPress }) => {
  const questionCount = getCategoryQuestionCount(category.id);
  const maxSavings = getCategoryMaxSavings(category.id);

  return (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        (!isActive || !hasQuestions) && styles.inactiveCard
      ]}
      onPress={onPress}
      disabled={!isActive || !hasQuestions}
    >
      <View style={[styles.categoryIconContainer, { backgroundColor: category.color }]}>
        <category.icon width={32} height={32} color="#FFFFFF" />
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
        {isActive && (
          <View style={styles.badgeContainer}>
            <View style={styles.improvementBadge}>
              <Text style={styles.improvementText}>{strings.needsImprovement}</Text>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.questionCount}>
                {questionCount} {strings.tasks}
              </Text>
              <Text style={styles.potentialSaving}>
                {maxSavings}L {strings.potential}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const ChallengesScreen = ({ route, navigation }) => {
  const { improvementAreas = [] } = route.params || {};
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState({});

  // Kategoriye göre ilgili soruyu bul
  const findQuestionForCategory = (categoryId) => {
    return questions.find(q => q.category === categoryId);
  };

  const handleCategoryPress = (category) => {
    // Kategoriye ait tüm soruları bulalım
    const categoryQuestions = questions.filter(q => q.category === category.id);
    
    if (categoryQuestions.length > 0) {
      // İlk soruyu gösterelim
      setCurrentQuestion(categoryQuestions[0]);
      setShowQuestionModal(true);
    } else {
      console.warn('No questions found for category:', category.id);
    }
  };

  const handleAnswer = (option) => {
    // Önceki cevapla karşılaştır ve ilerleme kaydet
    const previousAnswer = progress[currentQuestion.id];
    if (!previousAnswer || option.valueSaving > previousAnswer.valueSaving) {
      // İyileşme var, achievement ekle
      setAchievements(prev => [...prev, {
        category: currentQuestion.category,
        improvement: option.valueSaving - (previousAnswer?.valueSaving || 0),
        message: option.task
      }]);
    }

    // Progress'i güncelle
    setProgress(prev => ({
      ...prev,
      [currentQuestion.id]: option
    }));

    setShowQuestionModal(false);
  };

  const renderQuestionModal = () => (
    <Modal
      visible={showQuestionModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.questionText}>{currentQuestion?.text}</Text>
          
          {currentQuestion?.content && (
            <View style={styles.contentContainer}>
              <Text style={styles.contentMessage}>{currentQuestion.content.message}</Text>
              {currentQuestion.content.video && (
                <TouchableOpacity style={styles.videoButton}>
                  <Text style={styles.videoButtonText}>Watch Tutorial</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.additionalInfo}>{currentQuestion.content.additionalInfo}</Text>
            </View>
          )}

          <View style={styles.optionsContainer}>
            {currentQuestion?.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleAnswer(option)}
              >
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowQuestionModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  useEffect(() => {
    console.log('Active categories:', improvementAreas);
  }, [improvementAreas]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{strings.challengeTitle}</Text>
          <Text style={styles.subtitle}>{strings.challengeDescription}</Text>
        </View>

        {achievements.length > 0 && (
          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>{strings.recentAchievements}</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsScroll}
            >
              {achievements.map((achievement, index) => (
                <View key={index} style={styles.achievementCard}>
                  <Text style={styles.achievementValue}>
                    {achievement.improvement}L
                  </Text>
                  <Text style={styles.achievementTitle}>
                    {achievement.category}
                  </Text>
                  <Text style={styles.achievementMessage}>
                    {achievement.message}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>{strings.categories}</Text>
          {Object.values(categories).map(category => {
            const isActive = improvementAreas.includes(category.id);
            const hasQuestions = questions.some(q => q.category === category.id);
            
            return (
              <CategoryCard
                key={category.id}
                category={category}
                isActive={isActive}
                hasQuestions={hasQuestions}
                onPress={() => {
                  if (isActive && hasQuestions) {
                    handleCategoryPress(category);
                  }
                }}
              />
            );
          })}
        </View>

        {renderQuestionModal()}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
  },
  categoryButtonActive: {
    backgroundColor: '#2196F3',
  },
  categoryText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'right',
  },
  tasksContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskCardCompleted: {
    borderLeftColor: '#4CAF50',
    backgroundColor: '#F5F5F5',
  },
  taskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  taskTextCompleted: {
    color: '#888',
    textDecorationLine: 'line-through',
  },
  pointsContainer: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  pointsText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  improvementBadge: {
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  improvementText: {
    color: '#F57C00',
    fontSize: 12,
    fontWeight: '500',
  },
  questionCount: {
    fontSize: 12,
    color: '#666',
  },
  achievementsScroll: {
    paddingHorizontal: 20,
  },
  achievementCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: 200,
  },
  achievementValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  categoriesContainer: {
    marginTop: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    width: '80%',
    maxHeight: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  contentContainer: {
    marginBottom: 20,
  },
  contentMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  videoButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  videoButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  additionalInfo: {
    fontSize: 14,
    color: '#666',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  optionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  achievementsContainer: {
    marginBottom: 20,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  achievementMessage: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
}); 