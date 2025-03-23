import React, { useState, useEffect, useCallback } from 'react';
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
import { getTutorialVideo, getYoutubeVideoId, getYoutubeEmbedUrl } from '../services/TutorialService';

const { width } = Dimensions.get('window');

const CategoryCard = ({ category, isActive, hasQuestions, onPress }) => {
  const questionCount = getCategoryQuestionCount(category.id);
  const maxSavings = getCategoryMaxSavings(category.id);

  const Icon = category.icon;

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
        <Icon width={32} height={32} color="#FFFFFF" />
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

export const ChallengesScreen = ({ route }) => {
  const { improvementAreas = [] } = route.params || {};
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState({});
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialContent, setTutorialContent] = useState(null);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [showCategoryVideo, setShowCategoryVideo] = useState(false);
  const [currentCategoryVideo, setCurrentCategoryVideo] = useState(null);

  // Tek bir useEffect ile tüm veriyi yükle
  useEffect(() => {
    let isMounted = true; // Component mount durumunu takip et

    const loadData = async () => {
      try {
        // Başarıları yükle
        const savedAchievements = await StorageService.getAchievements() || [];
        const savedProgress = await StorageService.getProgress() || {};

        if (!isMounted) return; // Component unmount olduysa state güncelleme

        // State'leri güncelle
        setAchievements(savedAchievements);
        setProgress(savedProgress);

        // Günlük görevleri hazırla
        const tasks = [];
        improvementAreas.forEach(areaId => {
          const category = categories[areaId];
          if (category?.tips) {
            category.tips.forEach(tip => {
              if (tip.video || tip.additionalInfo) {
                tasks.push({
                  id: `${areaId}-${tip.id}`,
                  title: tip.title,
                  message: tip.message,
                  category: areaId,
                  type: tip.video ? 'video' : 'article',
                  content: tip,
                  completed: false
                });
              }
            });
          }
        });

        if (!isMounted) return;
        setDailyTasks(tasks);

      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Boş dependency array - sadece mount olduğunda çalışsın

  // Kategori seçildiğinde
  const handleCategoryPress = useCallback((category) => {
    const tutorialVideo = getTutorialVideo(category.id);
    if (tutorialVideo) {
      setCurrentCategoryVideo(tutorialVideo);
      setShowCategoryVideo(true);
      return;
    }

    setCurrentQuestion(null);
    setShowQuestionModal(false);
    setShowTutorial(false);
    
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
  }, [progress]);

  // Görev tamamlandığında
  const handleTaskCompletion = useCallback((task) => {
    handleTutorial(task.content);
  }, []);

  const handleAnswer = async (option) => {
    try {
      setShowQuestionModal(false);
      
      if (currentQuestion && option) {
        const updatedProgress = { ...progress };
        const questionId = currentQuestion.id;
        
        updatedProgress[questionId] = {
          completed: true,
          answer: option,
          date: new Date().toISOString()
        };
        
        setProgress(updatedProgress);
        await StorageService.saveProgress(updatedProgress);
        
        // Başarıyı kaydet
        if (option.improvement) {
          const achievement = {
            category: currentQuestion.category,
            improvement: option.improvement,
            message: option.achievementMessage || option.text,
            date: new Date().toISOString()
          };
          
          const achievements = await StorageService.getAchievements() || [];
          achievements.push(achievement);
          await StorageService.saveAchievements(achievements);
        }
        
        // Bildirimi planla
        if (option.reminderDays) {
          NotificationService.scheduleNotification(
            questionId,
            currentQuestion.text,
            option.reminderMessage || option.text,
            option.reminderDays
          );
        }
      }
      
      // Modal'ı kapatmadan önce kısa bir gecikme ekle
      setTimeout(() => {
        setCurrentQuestion(null);
      }, 100);
      
    } catch (error) {
      console.error('Error saving answer:', error);
      Alert.alert(strings.error, strings.errorMessage);
    }
  };

  const handleQuestionPress = (question) => {
    // Eğer soru zaten tamamlanmışsa ve tekrar açılıyorsa, progress'i kontrol et
    if (progress[question.id]?.completed) {
      setCurrentQuestion(question);
      setShowQuestionModal(true);
      return;
    }
    
    // Yeni soru için
    setCurrentQuestion(question);
    setShowQuestionModal(true);
  };

  const handleTutorial = (content) => {
    if (!content) return;
    
    setTutorialContent(content);
    
    const isVideoUrl = content.video?.includes('youtube.com') || 
                      content.video?.includes('vimeo.com') ||
                      content.video?.includes('dailymotion.com');
    
    if (isVideoUrl) {
      setShowTutorial(true);
    } else if (content.video) { // Eğer video URL'i değilse makale linki olarak kabul et
      Linking.openURL(content.video).catch(err => {
        console.error('Link açılamadı:', err);
        Alert.alert(strings.error, strings.videoLoadError);
      });
    } else if (content.additionalInfo) {
      Alert.alert(
        strings.learnMore,
        content.additionalInfo,
        [
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
              <MaterialCommunityIcons name="close" size={24} color="#666" />
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

  // Günlük görevleri render et
  const renderDailyTasks = () => (
    <View style={styles.tasksContainer}>
      <Text style={styles.sectionTitle}>{strings.dailyTasks}</Text>
      {dailyTasks.map((task, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
          onPress={() => !task.completed && handleTaskCompletion(task)}
        >
          <View style={styles.taskContent}>
            <MaterialCommunityIcons 
              name={task.type === 'video' ? 'play-circle' : 'book-open-variant'} 
              size={24} 
              color={task.completed ? '#4CAF50' : '#2196F3'} 
              style={styles.taskIcon}
            />
            <View style={styles.taskTextContainer}>
              <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                {task.title}
              </Text>
              <Text style={styles.taskMessage}>{task.message}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  useEffect(() => {
    console.log('Active categories:', improvementAreas);
  }, [improvementAreas]);

  const renderImprovementTips = () => (
    <View style={styles.tipsContainer}>
      <Text style={styles.sectionTitle}>{strings.improvementTips}</Text>
      {improvementAreas.map((areaId) => {
        const category = categories[areaId];
        if (!category) return null;

        return (
          <View key={areaId} style={styles.areaContainer}>
            <View style={[styles.areaHeader, { backgroundColor: category.color }]}>
              <category.icon width={24} height={24} color="#FFF" />
              <Text style={styles.areaTitle}>{category.title}</Text>
            </View>
            {category.tips?.map((tip, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tipCard}
                onPress={() => handleTutorial(tip)}
              >
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipMessage}>{tip.message}</Text>
                </View>
                <MaterialCommunityIcons
                  name={tip.video ? "play-circle" : "book-open-variant"}
                  size={24}
                  color="#2196F3"
                />
              </TouchableOpacity>
            ))}
          </View>
        );
      })}
    </View>
  );

  useEffect(() => {
    const checkAllCompleted = async () => {
      const savedProgress = await StorageService.getProgress() || {};
      const allTasks = Object.values(savedProgress);
      const completedTasks = allTasks.filter(task => task.completed);
      
      if (allTasks.length > 0 && allTasks.length === completedTasks.length) {
        Alert.alert(
          '🎉 ' + strings.allTasksCompleted,
          strings.allTasksCompletedMessage,
          [{ text: strings.ok }]
        );
      }
    };

    checkAllCompleted();
  }, [progress]);

  const renderCategoryVideoModal = () => {
    if (!currentCategoryVideo) return null;

    const videoId = getYoutubeVideoId(currentCategoryVideo.url);
    const embedUrl = videoId ? getYoutubeEmbedUrl(videoId) : null;

    return (
      <Modal
        visible={showCategoryVideo}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowCategoryVideo(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{currentCategoryVideo.title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowCategoryVideo(false);
                setCurrentCategoryVideo(null);
              }}
            >
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {embedUrl && (
            <WebView
              source={{ uri: embedUrl }}
              style={styles.webview}
              allowsFullscreenVideo
              javaScriptEnabled
            />
          )}
          <TouchableOpacity
            style={styles.startChallengeButton}
            onPress={() => {
              setShowCategoryVideo(false);
              setCurrentCategoryVideo(null);
              handleCategoryPress(categories[currentCategoryVideo.category]);
            }}
          >
            <Text style={styles.startChallengeText}>Görevi Başlat</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{strings.challengeTitle}</Text>
          <Text style={styles.subtitle}>{strings.challengeDescription}</Text>
        </View>

        {/* Kategoriler */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>{strings.categories}</Text>
          {Object.values(categories).map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isActive={improvementAreas.includes(category.id)}
              hasQuestions={getCategoryQuestionCount(category.id) > 0}
              onPress={() => handleCategoryPress(category)}
            />
          ))}
        </View>

        {/* Günlük Görevler */}
        {dailyTasks.length > 0 && renderDailyTasks()}

        {renderQuestionModal()}
        {renderTutorialModal()}
        {renderCategoryVideoModal()}
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
    marginBottom: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
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
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
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
    marginTop: 8,
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
    backgroundColor: '#FFF',
  },
  tipContent: {
    flex: 1,
    marginRight: 16,
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
    lineHeight: 20,
  },
  taskIcon: {
    marginRight: 12,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    color: '#4CAF50',
  },
  taskMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startChallengeButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startChallengeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 