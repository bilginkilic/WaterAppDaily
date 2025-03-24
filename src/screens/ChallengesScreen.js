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
  AsyncStorage,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { categories, categoryIds } from '../data/categories';
import questions from '../data/questions';
import strings from '../localization/strings';
import { questionsByCategory, getCategoryQuestionCount, getCategoryMaxSavings } from '../data/questionsByCategory';
import { WebView } from 'react-native-webview';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import StorageService from '../services/StorageService';
import { NotificationService } from '../services';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getTutorialVideo, getYoutubeVideoId, getYoutubeEmbedUrl } from '../services/TutorialService';
import { ProfileScreen } from './ProfileScreen';

const Tab = createBottomTabNavigator();

const { width } = Dimensions.get('window');

const CategoryCard = ({ category, isActive, hasQuestions, onPress }) => {
  const questionCount = getCategoryQuestionCount(category.id);
  const maxSavings = getCategoryMaxSavings(category.id);
  const progress = category.progress || 0;
  const categoryColor = category.color || '#2196F3';
  const IconComponent = category.icon;

  return (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        (!isActive || !hasQuestions) && styles.inactiveCard
      ]}
      onPress={onPress}
      disabled={!isActive || !hasQuestions}
    >
      <View style={[styles.categoryIconContainer, { backgroundColor: categoryColor }]}>
        {typeof IconComponent === 'function' ? (
          <IconComponent width={32} height={32} color="#FFFFFF" />
        ) : (
          <MaterialCommunityIcons 
            name={category.icon || 'water'} 
            size={32} 
            color="#FFFFFF" 
          />
        )}
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
        {isActive && hasQuestions && (
          <>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progress}%`,
                    backgroundColor: categoryColor 
                  }
                ]} 
              />
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.questionCount}>
                {questionCount} Recommended Tasks
              </Text>
              <Text style={styles.potentialSaving}>
                Potential Savings: {maxSavings}L
              </Text>
            </View>
          </>
        )}
        {!isActive && (
          <Text style={styles.inactiveText}>This category is not active for your profile</Text>
        )}
        {!hasQuestions && isActive && (
          <Text style={styles.completedText}>All tasks completed successfully!</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ChallengesContent = ({ route, navigation }) => {
  const { improvementAreas = [], waterProfile = null } = route.params || {};
  const [tasks, setTasks] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [achievements, setAchievements] = useState([]);

  const loadData = async () => {
    try {
      console.log('Loading tasks...');
      console.log('Improvement Areas:', improvementAreas);

      // Ensure water profile exists
      await StorageService.ensureWaterProfile();

      // First, validate and update all tasks
      await StorageService.validateAndUpdateTasks();
      
      // Then get the validated tasks
      const savedTasks = await StorageService.getTasks();
      console.log('Saved Tasks:', savedTasks);

      if (!savedTasks || !Array.isArray(savedTasks)) {
        console.warn('No saved tasks found or invalid format');
        setTasks([]);
        setLoading(false);
        return;
      }

      // Filter tasks based on improvement areas and completion status
      let activeTasks;
      if (improvementAreas && improvementAreas.length > 0) {
        console.log('Filtering tasks by improvement areas:', improvementAreas);
        activeTasks = savedTasks.filter(task => 
          improvementAreas.includes(task.category) && !task.completed
        );
        console.log('Filtered tasks:', activeTasks);
      } else {
        console.log('No improvement areas specified, showing all uncompleted tasks');
        activeTasks = savedTasks.filter(task => !task.completed);
      }

      setTasks(activeTasks);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    }
  };

  useEffect(() => {
    loadData();
  }, [improvementAreas]);

  const handleTaskPress = async (task) => {
    console.log('Task pressed:', task);
    if (!task) {
      console.warn('No task data provided to handleTaskPress');
      return;
    }

    try {
      // Get the original question from questions array
      const originalQuestion = questions.find(q => q.id === task.id);
      if (!originalQuestion) {
        console.warn('Original question not found');
        return;
      }

      console.log('Original question:', originalQuestion);

      setCurrentQuestion({
        id: task.id,
        content: originalQuestion.text,
        options: originalQuestion.options,
        task: task,
        additionalInfo: originalQuestion.additionalInfo || originalQuestion.content?.additionalInfo
      });
      setShowQuestionModal(true);
    } catch (error) {
      console.error('Error in handleTaskPress:', error);
      Alert.alert('Error', 'Failed to load question details.');
    }
  };

  const handleWatchVideo = (categoryId) => {
    try {
      const videoData = getTutorialVideo(categoryId);
      console.log('Video data:', videoData);
      
      // Önce TutorialService'ten videoyu al
      if (videoData && videoData.url) {
        console.log('Video URL:', videoData.url);
        
        // Doğrudan YouTube'u açmak için Linking kullan
        Linking.canOpenURL(videoData.url).then(supported => {
          if (supported) {
            Linking.openURL(videoData.url);
          } else {
            console.log('Cannot open URL: ' + videoData.url);
            Alert.alert(
              'Video Player',
              'Cannot open the video URL. Would you like to copy it to clipboard?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel'
                },
                {
                  text: 'Copy URL',
                  onPress: () => {
                    Clipboard.setString(videoData.url);
                    Alert.alert('URL Copied', 'Video URL has been copied to clipboard');
                  }
                }
              ]
            );
          }
        }).catch(err => {
          console.error('Error opening URL:', err);
          Alert.alert(strings.error, strings.videoLoadError);
        });
      } else {
        // TutorialService'te video yoksa, doğrudan questions.js'ten al
        const question = questions.find(q => q.category === categoryId);
        if (question && question.content && question.content.video) {
          console.log('Fallback question video URL:', question.content.video);
          
          // Doğrudan YouTube'u açmak için Linking kullan
          Linking.canOpenURL(question.content.video).then(supported => {
            if (supported) {
              Linking.openURL(question.content.video);
            } else {
              console.log('Cannot open URL: ' + question.content.video);
              Alert.alert(
                'Video Player',
                'Cannot open the video URL. Would you like to copy it to clipboard?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  },
                  {
                    text: 'Copy URL',
                    onPress: () => {
                      Clipboard.setString(question.content.video);
                      Alert.alert('URL Copied', 'Video URL has been copied to clipboard');
                    }
                  }
                ]
              );
            }
          }).catch(err => {
            console.error('Error opening URL:', err);
            Alert.alert(strings.error, strings.videoLoadError);
          });
        } else {
          Alert.alert(strings.error, strings.videoLoadError);
        }
      }
    } catch (error) {
      console.error('Error loading video:', error);
      Alert.alert(strings.error, strings.videoLoadError);
    }
  };

  const handleModalResponse = async (selectedOption) => {
    if (!currentQuestion?.task) return;

    try {
      console.log('Selected option:', selectedOption);
      const task = currentQuestion.task;

      // If the selected option is of type Achievement
      if (selectedOption.type === 'Achievement') {
        console.log('Converting task to achievement...');

        // Create new achievement
        const newAchievement = {
          id: task.id,
          category: task.category,
          type: 'Achievement',
          date: new Date().toISOString(),
          improvement: selectedOption.valueSaving,
          message: selectedOption.task,
          waterUsage: selectedOption.valueTotal
        };

        // Add to achievements
        const currentAchievements = await StorageService.getAchievements();
        const updatedAchievements = [...(currentAchievements || []), newAchievement];
        await StorageService.saveAchievements(updatedAchievements);

        // Update local state for achievements
        setAchievements(updatedAchievements);

        // Mark task as completed
        const updatedTask = { ...task, completed: true };
        await StorageService.updateTaskProgress(updatedTask);

        // Update tasks state to reflect completion
        setTasks(prevTasks => prevTasks.map(t => 
          t.id === task.id ? { ...t, completed: true } : t
        ));

        // Update water footprint
        const progress = await StorageService.ensureWaterProfile();
        
        // Get updated total water footprint by summing valueTotal from all current answers
        const answers = await StorageService.getAnswers();
        // Find the answer that corresponds to this task and replace it
        const updatedAnswers = answers.map(answer => 
          answer.questionId === task.id ? 
          {...answer, answer: selectedOption.text, waterprintValue: selectedOption.valueTotal} : 
          answer
        );
        await StorageService.saveAnswers(updatedAnswers);
        
        // Calculate new water footprint based on all current answers
        const newWaterprint = updatedAnswers.reduce((total, answer) => 
          total + (answer.waterprintValue || 0), 0);
        
        // Ensure all required fields exist in progress object
        const updatedProgress = {
          initialWaterprint: progress?.initialWaterprint || newWaterprint,
          currentWaterprint: newWaterprint,
          waterprintReduction: (progress?.initialWaterprint || newWaterprint) - newWaterprint,
          completedTasks: [...(progress?.completedTasks || []), task.id],
          progressHistory: [
            ...(progress?.progressHistory || []),
            {
              date: new Date(),
              waterprint: newWaterprint
            }
          ]
        };

        await StorageService.saveProgress(updatedProgress);

        // Update API
        try {
          const token = await StorageService.getToken();
          const response = await fetch('https://waterappdashboard2.onrender.com/api/waterprint/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token || ''}`
            },
            body: JSON.stringify({
              currentWaterprint: newWaterprint,
              taskId: task.id,
              waterprintReduction: selectedOption.valueSaving
            })
          });

          if (!response.ok) {
            throw new Error('API update failed');
          }

          console.log('API updated successfully');
        } catch (error) {
          console.error('API update error:', error);
          // Continue with local updates even if API fails
        }

        // Show success message
        Alert.alert(
          'Achievement Unlocked!',
          'Congratulations! You\'ve earned a new achievement and reduced your water footprint.',
          [{ text: 'OK' }]
        );

        // Reload tasks
        loadData();
      } else {
        // If not achievement type, just close the modal
        setShowQuestionModal(false);
      }
    } catch (error) {
      console.error('Error in handleModalResponse:', error);
      Alert.alert('Error', 'Failed to update your progress.');
    } finally {
      setShowQuestionModal(false);
    }
  };

  const renderQuestionModal = () => {
    if (!currentQuestion) return null;

    return (
      <Modal
        visible={showQuestionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQuestionModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{strings.challengeTitle}</Text>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setShowQuestionModal(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollContainer}>
              <Text style={styles.modalQuestion}>{currentQuestion.content}</Text>
              
              {/* Video tutorial button */}
              <TouchableOpacity 
                style={styles.watchVideoButton}
                onPress={() => handleWatchVideo(currentQuestion.task.category)}
              >
                <MaterialIcons name="ondemand-video" size={20} color="#FFFFFF" />
                <Text style={styles.watchVideoText}>{strings.watchTutorial}</Text>
              </TouchableOpacity>
              
              {currentQuestion.additionalInfo && (
                <Text style={styles.additionalInfo}>{currentQuestion.additionalInfo}</Text>
              )}
              
              <View style={styles.optionsContainer}>
                <Text style={styles.optionsTitle}>Select your answer:</Text>
                {currentQuestion.options && currentQuestion.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      option.type === 'Achievement' && styles.achievementOption
                    ]}
                    onPress={() => handleModalResponse(option)}
                  >
                    <Text style={styles.optionText}>{option.text}</Text>
                    {option.type === 'Achievement' && (
                      <View style={styles.achievementTag}>
                        <MaterialIcons name="star" size={14} color="#FFD700" />
                        <Text style={styles.achievementTagText}>Achievement</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderVideoModal = () => {
    return (
      <Modal
        visible={showVideoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVideoModal(false)}
      >
        <View style={styles.videoModalContainer}>
          <View style={styles.videoModalContent}>
            <View style={styles.videoModalHeader}>
              <Text style={styles.videoModalTitle}>{strings.watchTutorial}</Text>
              <TouchableOpacity
                style={styles.closeVideoButton}
                onPress={() => setShowVideoModal(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.webviewContainer}>
              {videoUrl ? (
                <WebView
                  originWhitelist={['*']}
                  source={{ html: videoUrl }}
                  style={styles.webview}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  allowsFullscreenVideo={true}
                  mediaPlaybackRequiresUserAction={false}
                  onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.error('WebView error:', nativeEvent);
                    Alert.alert(strings.error, strings.videoLoadError);
                  }}
                  onHttpError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.error('WebView HTTP Error:', nativeEvent);
                    Alert.alert(strings.error, strings.videoLoadError);
                  }}
                  startInLoadingState={true}
                  renderLoading={() => (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                  )}
                />
              ) : (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Video cannot be loaded</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.videoDescription}>
              Watch this educational video to learn more about water conservation techniques that can help you complete this challenge.
            </Text>
            
            <TouchableOpacity
              style={styles.returnToChallengeButton}
              onPress={() => setShowVideoModal(false)}
            >
              <Text style={styles.returnToChallengeText}>Return to Challenge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const getTaskEmoji = (category) => {
    switch (category) {
      case categoryIds.DISHWASHING:
        return '🍽️';
      case categoryIds.SHOWER:
        return '🚿';
      case categoryIds.LAUNDRY:
        return '👕';
      case categoryIds.PLUMBING:
        return '🔧';
      case categoryIds.DAILY:
        return '📅';
      case categoryIds.CAR:
        return '🚗';
      default:
        return '💧';
    }
  };

  const getTaskDescription = (task) => {
    const category = categories[task.category];
    const categoryName = category ? category.title : task.category;
    
    // Find the original question
    const question = questions.find(q => q.id === task.id);
    if (!question) return task.description || 'Complete this task to reduce your water footprint.';

    // Get the task option (the one with type 'Task')
    const taskOption = question.options.find(opt => opt.type === 'Task');
    if (!taskOption) return task.description || 'Complete this task to reduce your water footprint.';

    // Get the achievement option (the one with type 'Achievement')
    const achievementOption = question.options.find(opt => opt.type === 'Achievement');
    
    // Build the description
    let description = `${question.text}\n\n`;
    description += `Current situation: ${taskOption.text}\n`;
    description += `Goal: ${achievementOption.text}\n\n`;
    description += `This task is part of your ${categoryName} conservation plan. Tap to learn more and watch an educational video on this topic.`;
    
    return description;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeTitle}>Your Water-Saving Journey</Text>
          <Text style={styles.challengeSubtitle}>
            Complete these challenges to reduce your water footprint. Watch the educational videos and make sustainable choices to earn achievements.
          </Text>
        </View>

        {/* Show Active Tasks */}
        {tasks.length > 0 ? (
          <View style={styles.section}>
            {tasks.map((task, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.taskCard,
                  task.completed && styles.completedTask
                ]}
                onPress={() => handleTaskPress(task)}
              >
                <View style={styles.taskContent}>
                  <Text style={styles.taskEmoji}>{getTaskEmoji(task.category)}</Text>
                  <View style={styles.taskTextContainer}>
                    <Text style={styles.taskDescription}>
                      {getTaskDescription(task)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Complete the water usage survey to receive personalized challenges and start your water-saving journey.
            </Text>
          </View>
        )}

        {renderQuestionModal()}
        {renderVideoModal()}
      </ScrollView>
    </SafeAreaView>
  );
};

const AchievementsScreen = ({ achievements }) => {
  const getAchievementIcon = (category) => {
    switch (category) {
      case categoryIds.DISHWASHING:
        return 'dishwasher';
      case categoryIds.SHOWER:
        return 'shower';
      case categoryIds.LAUNDRY:
        return 'washing-machine';
      case categoryIds.PLUMBING:
        return 'water-pump';
      case categoryIds.DAILY:
        return 'calendar-check';
      case categoryIds.CAR:
        return 'car-wash';
      default:
        return 'water';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case categoryIds.DISHWASHING:
        return '#FF9800';
      case categoryIds.SHOWER:
        return '#2196F3';
      case categoryIds.LAUNDRY:
        return '#9C27B0';
      case categoryIds.PLUMBING:
        return '#F44336';
      case categoryIds.DAILY:
        return '#4CAF50';
      case categoryIds.CAR:
        return '#795548';
      default:
        return '#607D8B';
    }
  };

  const getAchievementDescription = (achievement) => {
    const question = questions.find(q => q.id === achievement.id);
    if (!question) return achievement.message;

    const achievementOption = question.options.find(opt => opt.type === 'Achievement');
    if (!achievementOption) return achievement.message;

    return `${question.text}\n\nYou've achieved: ${achievementOption.text}\n\nThis achievement helps you save ${achievement.improvement}L of water.`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {achievements.length > 0 ? (
          <View style={styles.section}>
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementCard}>
                <View style={[styles.achievementIconContainer, { backgroundColor: getCategoryColor(achievement.category) }]}>
                  <MaterialCommunityIcons 
                    name={getAchievementIcon(achievement.category)}
                    size={24} 
                    color="#FFFFFF" 
                  />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>
                    {categories[achievement.category]?.title || achievement.category}
                  </Text>
                  <Text style={styles.achievementDescription}>
                    {getAchievementDescription(achievement)}
                  </Text>
                  <View style={styles.achievementFooter}>
                    <Text style={styles.achievementDate}>
                      {new Date(achievement.date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.achievementSaving}>
                      Saved: {achievement.improvement}L
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="trophy-outline" size={64} color="#2196F3" />
            <Text style={styles.emptyText}>
              Complete water-saving challenges to earn achievements!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export const ChallengesScreen = ({ route, navigation }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedAchievements = await StorageService.getAchievements();
        setAchievements(savedAchievements || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading achievements:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Challenges') {
            iconName = focused ? 'flag' : 'flag-outline';
          } else if (route.name === 'Achievements') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Challenges" 
        component={ChallengesContent}
        initialParams={route.params}
      />
      <Tab.Screen 
        name="Achievements" 
        children={() => <AchievementsScreen achievements={achievements} />}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
      />
    </Tab.Navigator>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementDate: {
    fontSize: 12,
    color: '#999',
  },
  achievementSaving: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  taskEmoji: {
    fontSize: 28,
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  completedTask: {
    opacity: 0.7,
    borderLeftColor: '#4CAF50',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeModalButton: {
    padding: 4,
  },
  modalScrollContainer: {
    padding: 20,
  },
  modalQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  watchVideoButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  watchVideoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  additionalInfo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  optionsContainer: {
    marginVertical: 16,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionButton: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  achievementOption: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFE082',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
  achievementTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  achievementTagText: {
    fontSize: 14,
    color: '#FF8F00',
    fontWeight: '500',
    marginLeft: 4,
  },
  videoModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  videoModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  videoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  videoModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeVideoButton: {
    padding: 4,
  },
  webviewContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
    overflow: 'hidden',
    borderRadius: 8,
  },
  webview: {
    width: '100%',
    height: '100%',
  },
  videoDescription: {
    fontSize: 14,
    color: '#666',
    padding: 16,
    lineHeight: 20,
  },
  returnToChallengeButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    margin: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  returnToChallengeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    width: '100%',
    height: '100%', 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  challengeHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  challengeSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 