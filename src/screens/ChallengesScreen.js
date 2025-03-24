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
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { categories } from '../data/categories';
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
                {questionCount} görev
              </Text>
              <Text style={styles.potentialSaving}>
                {maxSavings}L tasarruf potansiyeli
              </Text>
            </View>
          </>
        )}
        {!isActive && (
          <Text style={styles.inactiveText}>Bu kategori sizin için aktif değil</Text>
        )}
        {!hasQuestions && isActive && (
          <Text style={styles.completedText}>Tüm görevler tamamlandı!</Text>
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

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading tasks...');
        console.log('Improvement Areas:', improvementAreas);

        const savedTasks = await StorageService.getTasks();
        
        console.log('Saved Tasks:', savedTasks);

        // Filter tasks based on improvement areas
        const activeTasks = savedTasks ? savedTasks.filter(task => 
          improvementAreas.includes(task.category)
        ) : [];
        
        console.log('Active Tasks:', activeTasks);
        
        setTasks(activeTasks);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
        Alert.alert(
          'Error',
          'Failed to load tasks. Please try again.'
        );
      }
    };

    loadData();
  }, [improvementAreas]);

  const handleTaskPress = (task) => {
    console.log('Task pressed:', task);
    if (!task) {
      console.warn('No task data provided to handleTaskPress');
      return;
    }

    const defaultOptions = [
      { text: 'Yes', value: true },
      { text: 'No', value: false }
    ];

    setCurrentQuestion({
      content: task.description || 'Did you complete this task?',
      options: task.options || defaultOptions,
      task: task
    });
    setShowQuestionModal(true);
  };

  const handleModalResponse = async (response) => {
    if (!currentQuestion?.task) return;

    try {
      const task = currentQuestion.task;
      const updatedTask = { ...task, completed: response };
      
      await StorageService.updateTaskProgress(updatedTask);
      await loadData(); // Reload tasks after update
      
      if (response) {
        NotificationService.scheduleNotification(
          'Task Completed!',
          'Great job on completing your water-saving task!'
        );
      }
    } catch (error) {
      console.error('Error updating task progress:', error);
    }

    setShowQuestionModal(false);
    setCurrentQuestion(null);
  };

  const renderQuestionModal = () => {
    if (!currentQuestion) return null;

    const message = currentQuestion.content || 'Did you complete this task?';
    const options = currentQuestion.options || [
      { text: 'Yes', value: true },
      { text: 'No', value: false }
    ];

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showQuestionModal}
        onRequestClose={() => setShowQuestionModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{message}</Text>
            {currentQuestion.additionalInfo && (
              <Text style={styles.modalSubtitle}>
                {currentQuestion.additionalInfo}
              </Text>
            )}
            <View style={styles.modalButtons}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalButton}
                  onPress={() => handleModalResponse(option.value)}
                >
                  <Text style={styles.modalButtonText}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
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
        <View style={styles.header}>
          <Text style={styles.title}>Water Saving Challenges</Text>
          <Text style={styles.subtitle}>Complete these tasks to reduce your water footprint</Text>
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
                  <MaterialCommunityIcons 
                    name={task.completed ? "check-circle" : "circle-outline"}
                    size={24} 
                    color={task.completed ? "#4CAF50" : "#2196F3"} 
                  />
                  <View style={styles.taskTextContainer}>
                    <Text style={styles.taskTitle}>{task.subject || task.category}</Text>
                    <Text style={styles.taskDescription}>
                      {task.text || task.description}
                    </Text>
                    <Text style={styles.taskSaving}>
                      Potential saving: {task.waterUsage}L
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No active challenges available at the moment.
            </Text>
          </View>
        )}

        {renderQuestionModal()}
      </ScrollView>
    </SafeAreaView>
  );
};

const AchievementsScreen = ({ achievements }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Water Saving Achievements</Text>
          <Text style={styles.subtitle}>Your completed water-saving milestones</Text>
        </View>
        {achievements.length > 0 ? (
          <View style={styles.section}>
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementCard}>
                <MaterialCommunityIcons 
                  name="trophy" 
                  size={24} 
                  color="#FFC107" 
                />
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>
                    {achievement.subject || achievement.category}
                  </Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.text || achievement.description}
                  </Text>
                  <Text style={styles.achievementSaving}>
                    Water saved: {achievement.waterUsage}L
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
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
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementContent: {
    marginLeft: 16,
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
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
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  taskSaving: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
    marginBottom: 24,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  achievementCategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  achievementMessage: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    marginRight: 8,
  },
  improvementValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
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
  taskText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
    fontStyle: 'italic'
  },
  achievementText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
    fontStyle: 'italic'
  },
}); 