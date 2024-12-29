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
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { categories } from '../data/categories';
import questions from '../data/questions';
import strings from '../localization/strings';
import { questionsByCategory, getCategoryQuestionCount, getCategoryMaxSavings } from '../data/questionsByCategory';
import { WebView } from 'react-native-webview';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { StorageService, NotificationService } from '../services';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialContent, setTutorialContent] = useState(null);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [improvementTips, setImprovementTips] = useState([]);

  // Kategoriye göre ilgili soruyu bul
  const findQuestionForCategory = (categoryId) => {
    return questions.find(q => q.category === categoryId);
  };

  const handleCategoryPress = (category) => {
    // Modal'ı sıfırla
    setCurrentQuestion(null);
    setShowQuestionModal(false);
    setShowTutorial(false);
    
    // Kategoriye ait tamamlanmamış soruları bul
    const categoryQuestions = questions.filter(q => 
      q.category === category.id && !progress[q.id]?.completed
    );
    
    if (categoryQuestions.length > 0) {
      setTimeout(() => {
        setCurrentQuestion(categoryQuestions[0]);
        setShowQuestionModal(true);
      }, 100);
    } else {
      Alert.alert(
        strings.categoryCompleted,
        strings.formatString(strings.categoryCompletedMessage, category.title),
        [{ text: strings.ok }]
      );
    }
  };

  const handleAnswer = async (option) => {
    const previousAnswer = progress[currentQuestion.id];
    
    if (option.type === 'Achievement') {
      // Achievement ise kaydet ve kapat
      if (!previousAnswer || option.valueSaving > previousAnswer.valueSaving) {
        const newAchievement = {
          category: currentQuestion.category,
          improvement: option.valueSaving - (previousAnswer?.valueSaving || 0),
          message: option.task,
          date: new Date().toISOString(),
          type: option.type
        };

        const newAchievements = [...achievements, newAchievement];
        setAchievements(newAchievements);
        await StorageService.saveAchievements(newAchievements);
      }

      const newProgress = {
        ...progress,
        [currentQuestion.id]: {
          ...option,
          completed: true,
          date: new Date().toISOString()
        }
      };
      
      setProgress(newProgress);
      await StorageService.saveProgress(newProgress);
      setShowQuestionModal(false);
    } else {
      // Achievement değilse motivasyon mesajı göster
      Alert.alert(
        strings.keepLearning,
        strings.keepLearningMessage,
        [
          {
            text: strings.watchTutorial,
            onPress: () => handleTutorial(currentQuestion.content)
          },
          {
            text: strings.close,
            style: 'cancel'
          }
        ]
      );
    }
  };

  const handleTutorial = async (content) => {
    setTutorialContent(content);
    
    // Yeni bir achievement olarak kaydet
    const newAchievement = {
      category: currentQuestion.category,
      improvement: 0, // Su tasarrufu yok ama öğrenme var
      message: content.video.includes('youtube.com') ? 
        strings.watchedTutorial : strings.readArticle,
      date: new Date().toISOString(),
      type: 'Learning'
    };

    const newAchievements = [...achievements, newAchievement];
    setAchievements(newAchievements);
    await StorageService.saveAchievements(newAchievements);
    
    // Video veya makaleyi göster
    const isVideoUrl = content.video.includes('youtube.com') || 
                      content.video.includes('vimeo.com') ||
                      content.video.includes('dailymotion.com');
    
    if (isVideoUrl) {
      setShowTutorial(true);
    } else {
      Alert.alert(
        strings.learnMore,
        content.additionalInfo,
        [
          {
            text: strings.readMore,
            onPress: () => Linking.openURL(content.video)
          },
          {
            text: strings.close,
            style: 'cancel'
          }
        ]
      );
    }
  };

  const renderTutorialModal = () => (
    <Modal
      visible={showTutorial}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setShowTutorial(false)}
    >
      <SafeAreaView style={styles.tutorialContainer}>
        <View style={styles.tutorialHeader}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowTutorial(false)}
          >
            <MaterialIcons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.tutorialTitle}>{strings.watchTutorial}</Text>
        </View>
        
        {tutorialContent?.video && (
          <WebView
            source={{ uri: tutorialContent.video }}
            style={styles.webview}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            scalesPageToFit
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
              setShowTutorial(false);
              Alert.alert(strings.error, strings.videoLoadError);
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );

  const renderQuestionModal = () => (
    <Modal
      visible={showQuestionModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.questionText}>{currentQuestion?.text}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowQuestionModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            {currentQuestion?.content && (
              <View style={styles.contentContainer}>
                <Text style={styles.contentMessage}>{currentQuestion.content.message}</Text>
                <Text style={styles.additionalInfo}>{currentQuestion.content.additionalInfo}</Text>
                
                {currentQuestion.content.video && (
                  <TouchableOpacity 
                    style={styles.videoButton}
                    onPress={() => handleTutorial(currentQuestion.content)}
                  >
                    <MaterialIcons name="play-circle-outline" size={24} color="#FFF" style={styles.buttonIcon} />
                    <Text style={styles.videoButtonText}>{strings.watchTutorial}</Text>
                  </TouchableOpacity>
                )}
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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Günlük görevleri yükle
  const loadDailyTasks = async () => {
    const progress = await StorageService.getProgress();
    const tasks = Object.entries(progress).map(([id, data]) => ({
      id,
      ...data,
      completed: data.completed || false
    }));
    setDailyTasks(tasks);
  };

  // Başlangıçta verileri yükle
  useEffect(() => {
    const loadData = async () => {
      const savedAchievements = await StorageService.getAchievements();
      const savedProgress = await StorageService.getProgress();
      
      if (savedAchievements) setAchievements(savedAchievements);
      if (savedProgress) setProgress(savedProgress);
      await loadDailyTasks();
    };
    loadData();
  }, []);

  // Görev tamamlandığında
  const handleTaskCompletion = async (taskId) => {
    const updatedTasks = dailyTasks.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    );
    setDailyTasks(updatedTasks);
    
    // Progress'i güncelle
    const newProgress = { ...progress };
    if (newProgress[taskId]) {
      newProgress[taskId].completed = true;
    }
    await StorageService.saveProgress(newProgress);
    setProgress(newProgress);

    // Tamamlanmamış görevleri kontrol et ve bildirim gönder
    const remainingTasks = updatedTasks.filter(task => !task.completed).length;
    if (remainingTasks > 0) {
      NotificationService.scheduleChallengeReminder(remainingTasks);
    }
  };

  // Görevleri render et
  const renderDailyTasks = () => (
    <View style={styles.tasksContainer}>
      <Text style={styles.sectionTitle}>{strings.dailyTasks}</Text>
      {dailyTasks.map((task, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.taskCard,
            task.completed && styles.taskCardCompleted
          ]}
          onPress={() => !task.completed && handleTaskCompletion(task.id)}
        >
          <View style={styles.taskContent}>
            <Text style={[
              styles.taskText,
              task.completed && styles.taskTextCompleted
            ]}>
              {task.text}
            </Text>
            {task.completed && (
              <MaterialCommunityIcons 
                name="check-circle" 
                size={24} 
                color="#4CAF50" 
              />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  useEffect(() => {
    console.log('Active categories:', improvementAreas);
  }, [improvementAreas]);

  useEffect(() => {
    if (improvementAreas.length > 0) {
      // Her improvement area için ilgili soruları ve ipuçlarını getir
      const tips = improvementAreas.map(areaId => {
        const categoryEntry = Object.entries(categories).find(([_, cat]) => cat.id === areaId);
        const category = categoryEntry ? categories[categoryEntry[0]] : null;
        
        const categoryQuestions = questions.filter(q => q.category === areaId);
        return {
          id: areaId,
          title: category?.title || '',
          color: category?.color || '#2196F3',
          icon: category?.icon,
          tips: categoryQuestions.map(q => ({
            id: q.id,
            title: q.text,
            message: q.content?.message || '',
            video: q.content?.video || '',
            additionalInfo: q.content?.additionalInfo || ''
          }))
        };
      });
      setImprovementTips(tips);
    }
  }, [improvementAreas]); // Sadece improvementAreas değiştiğinde çalışsın

  const renderImprovementTips = () => (
    <View style={styles.tipsContainer}>
      <Text style={styles.sectionTitle}>{strings.improvementTips}</Text>
      {improvementTips.map((area) => (
        <View key={area.id} style={styles.areaContainer}>
          <View style={[styles.areaHeader, { backgroundColor: area.color }]}>
            <area.icon width={24} height={24} color="#FFF" />
            <Text style={styles.areaTitle}>{area.title}</Text>
          </View>
          {area.tips.map((tip, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tipCard}
              onPress={() => handleTutorial(tip)}
            >
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipMessage} numberOfLines={2}>
                  {tip.message}
                </Text>
              </View>
              {tip.video && (
                <MaterialCommunityIcons 
                  name={tip.video.includes('youtube.com') ? 'youtube' : 'text-box'}
                  size={24} 
                  color="#666"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{strings.challengeTitle}</Text>
          <Text style={styles.subtitle}>{strings.challengeDescription}</Text>
        </View>

        {/* İyileştirme İpuçları */}
        {improvementTips.length > 0 && renderImprovementTips()}

        {/* Günlük Görevler */}
        {dailyTasks.length > 0 && renderDailyTasks()}

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
        {renderTutorialModal()}
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '80%',
    width: '100%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalScroll: {
    flex: 1,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  contentContainer: {
    padding: 20,
  },
  contentMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 24,
  },
  additionalInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  videoButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  videoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    padding: 20,
  },
  optionButton: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  optionText: {
    fontSize: 16,
    color: '#2196F3',
    textAlign: 'center',
    fontWeight: '500',
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
  tutorialContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  tutorialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1976D2',
  },
  closeButton: {
    padding: 8,
  },
  tutorialTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  tipsContainer: {
    marginTop: 20,
  },
  areaContainer: {
    marginBottom: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  areaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E3F2FD',
  },
  tipContent: {
    flex: 1,
    marginRight: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  tipMessage: {
    fontSize: 14,
    color: '#666',
  },
}); 