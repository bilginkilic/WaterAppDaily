import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import strings from '../localization/strings';
import { LineChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StorageService } from '../services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';

const RestartDialog = ({ visible, onClose, onConfirm }) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
  >
    <View style={styles.dialogOverlay}>
      <View style={styles.dialogContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#2196F3" />
        <Text style={styles.dialogTitle}>{strings.restartChallenge}</Text>
        <Text style={styles.dialogMessage}>{strings.restartChallengeConfirm}</Text>
        <View style={styles.dialogButtons}>
          <TouchableOpacity 
            style={[styles.dialogButton, styles.cancelButton]} 
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>{strings.cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.dialogButton, styles.confirmButton]} 
            onPress={onConfirm}
          >
            <Text style={styles.confirmButtonText}>{strings.confirm}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export const ProfileScreen = ({ route, navigation }) => {
  const params = route.params || {};
  const improvementAreas = params.improvementAreas || [];

  console.log('ProfileScreen - Route Params:', route.params);
  console.log('ProfileScreen - Improvement Areas:', improvementAreas);

  const maxChallenges = 2;
  
  const [pastChallenges, setPastChallenges] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [learningStats, setLearningStats] = useState({ videos: 0, articles: 0 });
  const [activeChallenges, setActiveChallenges] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [stats, setStats] = useState({ completed: 0, active: 0, successRate: 0 });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [dailySavings, setDailySavings] = useState({
    labels: [],
    data: []
  });
  const [waterFootprint, setWaterFootprint] = useState({
    initial: 0,
    current: 0
  });

  useEffect(() => {
    if (currentLanguage) {
      loadData();
    }
  }, [currentLanguage]);

  useEffect(() => {
    const initializeScreen = async () => {
      console.log('Initializing Profile Screen...');
      await loadLanguage();
      await loadData();
    };
    initializeScreen();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('userLanguage');
      setCurrentLanguage(savedLanguage || 'en');
    } catch (error) {
      console.error('Error loading language:', error);
      setCurrentLanguage('en');
    }
  };

  const loadData = async () => {
    try {
      const savedAchievements = await StorageService.getAchievements() || [];
      const currentProgress = await StorageService.getProgress() || {};
      const initialSurvey = await StorageService.getInitialSurvey() || {};
      
      // Su ayak izini hesapla
      const initialFootprint = StorageService.calculateWaterFootprint(initialSurvey);
      const currentFootprint = initialFootprint - totalSavings;
      
      setWaterFootprint({
        initial: initialFootprint,
        current: currentFootprint
      });

      // Günlük tasarrufları hesapla
      const dailyData = calculateDailySavings(savedAchievements);
      setDailySavings(dailyData);

      // Aktif challenge sayısını hesapla
      const activeCount = Object.values(currentProgress)
        .filter(p => !p.completed).length;
      setActiveChallenges(activeCount);

      setPastChallenges(savedAchievements);

      // Toplam tasarrufu hesapla
      const total = savedAchievements.reduce((acc, achievement) => 
        acc + (achievement.improvement || 0), 0);
      setTotalSavings(total);

      // Öğrenme istatistiklerini hesapla
      const learning = savedAchievements.reduce((acc, achievement) => {
        if (achievement.type === 'Learning') {
          if (achievement.message === strings.watchedTutorial) {
            acc.videos++;
          } else if (achievement.message === strings.readArticle) {
            acc.articles++;
          }
        }
        return acc;
      }, { videos: 0, articles: 0 });
      setLearningStats(learning);

      // Tamamlanan görevleri hesapla
      const completed = savedAchievements.filter(a => a.type === 'Achievement').length;
      const active = improvementAreas.length;
      const successRate = active > 0 ? Math.round((completed / active) * 100) : 0;

      setStats({ completed, active, successRate });

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateDailySavings = (achievements) => {
    if (!Array.isArray(achievements)) {
      return { labels: [], data: [] };
    }

    const dailyMap = {};
    const today = new Date();
    
    // Son 7 günü hazırla
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyMap[dateKey] = 0;
    }

    // Başarıları günlere göre topla
    achievements.forEach(achievement => {
      if (achievement?.improvement) {
        const dateKey = new Date(achievement.date).toISOString().split('T')[0];
        if (dailyMap[dateKey] !== undefined) {
          dailyMap[dateKey] += achievement.improvement;
        }
      }
    });

    // Grafik için verileri hazırla
    return {
      labels: Object.keys(dailyMap).map(date => date.split('-')[2]), // Sadece günü göster
      data: Object.values(dailyMap)
    };
  };

  // Debug için log ekleyelim
  useEffect(() => {
    console.log('Improvement Areas in Profile:', improvementAreas);
  }, [improvementAreas]);

  const calculateWeeklyData = (achievements) => {
    const weeks = {};
    const now = new Date();
    
    achievements.forEach(achievement => {
      if (achievement.improvement) {
        const date = new Date(achievement.date);
        const weekKey = getWeekKey(date);
        weeks[weekKey] = (weeks[weekKey] || 0) + achievement.improvement;
      }
    });

    // Son 4 haftayı al
    const labels = [];
    const data = [];
    for (let i = 3; i >= 0; i--) {
      const weekDate = new Date(now);
      weekDate.setDate(weekDate.getDate() - (i * 7));
      const key = getWeekKey(weekDate);
      labels.push(`Week ${3-i}`);
      data.push(weeks[key] || 0);
    }

    return { labels, data };
  };

  const getWeekKey = (date) => {
    const year = date.getFullYear();
    const week = Math.floor(date.getDate() / 7);
    return `${year}-${week}`;
  };

  const handleRestart = () => {
    setShowRestartDialog(true);
  };

  const handleRestartConfirm = async () => {
    // Mevcut challenge'ı geçmişe kaydet
    const currentProgress = await StorageService.getProgress();
    const currentDate = new Date().toISOString();
    
    if (currentProgress) {
      const pastChallenge = {
        date: currentDate,
        progress: currentProgress,
        totalSaving: Object.values(currentProgress)
          .reduce((acc, val) => acc + (val.valueSaving || 0), 0)
      };

      await StorageService.savePastChallenge(pastChallenge);
      await StorageService.clearCurrentProgress();
      setShowRestartDialog(false);
      
      // Survey'e git ama stack'i temizle
      navigation.reset({
        index: 0,
        routes: [{ name: 'Survey' }],
      });
    }
  };

  const waterSavingData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{
      data: [20, 45, 78, 120] // Litre cinsinden tasarruf
    }]
  };

  // Çıkış yapma fonksiyonu
  const handleSignOut = () => {
    Alert.alert(
      strings.signOut,
      strings.signOutConfirm,
      [
        {
          text: strings.cancel,
          style: 'cancel'
        },
        {
          text: strings.confirm,
          onPress: async () => {
            await StorageService.clearAllData();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  // Debug için reset fonksiyonu
  const handleResetData = () => {
    Alert.alert(
      strings.resetData,
      strings.resetDataConfirm,
      [
        {
          text: strings.cancel,
          style: 'cancel'
        },
        {
          text: strings.confirm,
          onPress: async () => {
            await StorageService.resetAllData();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  // Dil yükleme - sadece bir kez çalışacak
  useEffect(() => {
    const loadInitialLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('userLanguage');
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
        } else {
          setCurrentLanguage('en'); // Varsayılan dil
        }
      } catch (error) {
        console.error('Error loading language:', error);
        setCurrentLanguage('en');
      }
    };

    loadInitialLanguage();
  }, []); // Boş dependency array

  // Dil değiştirme fonksiyonu
  const handleLanguageChange = async (newLanguage) => {
    if (newLanguage === currentLanguage) return;

    try {
      await AsyncStorage.setItem('userLanguage', newLanguage);
      strings.setLanguage(newLanguage);
      setCurrentLanguage(newLanguage);

      // Dil değişikliğini bildir
      Alert.alert(
        strings.languageChanged,
        strings.languageChangeMessage,
        [{ 
          text: strings.ok,
          onPress: () => {
            // Main navigator üzerinden Profile tab'ine git
            navigation.reset({
              index: 0,
              routes: [{ 
                name: 'Main',
                params: { 
                  screen: 'Profile',
                  improvementAreas: improvementAreas 
                }
              }],
            });
          }
        }]
      );

    } catch (error) {
      console.error('Language change error:', error);
    }
  };

  // Test bildirimi gönderme fonksiyonu
  const sendTestNotification = () => {
    NotificationService.showNotification(
      'Test Bildirimi 🚰',
      'Su tasarrufu yolculuğunuzda yeni bir başarı kazandınız! 💧',
      {
        bigText: 'Bu bir test bildirimidir. Gerçek bildirimler su tasarrufu başarılarınızı ve günlük hatırlatmaları içerecektir.',
        subText: 'WaterSave',
        vibrate: true,
        playSound: true,
      }
    );
  };

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;

    try {
      // Burada gerçek bir API çağrısı yapılabilir
      // Şimdilik sadece simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        strings.feedbackSuccess,
        '',
        [{ 
          text: strings.ok,
          onPress: () => {
            setFeedback('');
            setShowFeedbackModal(false);
          }
        }]
      );
    } catch (error) {
      Alert.alert(strings.feedbackError);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Özet Kartı */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{strings.totalSavings}</Text>
        <Text style={styles.savingAmount}>{totalSavings}L</Text>
        <Text style={styles.savingDescription}>
          {strings.formatString(strings.savingEquivalent, '2 days')}
        </Text>
      </View>

      {/* Challenge Limiti Bilgisi */}
      {maxChallenges && (
        <View style={styles.limitCard}>
          <MaterialCommunityIcons name="information" size={24} color="#1976D2" />
          <Text style={styles.limitText}>
            {strings.formatString(strings.challengeLimit, activeChallenges, maxChallenges)}
          </Text>
        </View>
      )}

      {/* Su Ayak İzi Kartı */}
      <View style={styles.footprintCard}>
        <Text style={styles.sectionTitle}>{strings.waterFootprint}</Text>
        <View style={styles.footprintComparison}>
          <View style={styles.footprintItem}>
            <Text style={styles.footprintLabel}>{strings.initialFootprint}</Text>
            <Text style={styles.footprintValue}>{waterFootprint.initial}L</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={24} color="#666" />
          <View style={styles.footprintItem}>
            <Text style={styles.footprintLabel}>{strings.currentFootprint}</Text>
            <Text style={[
              styles.footprintValue,
              { color: waterFootprint.current < waterFootprint.initial ? '#4CAF50' : '#F44336' }
            ]}>{waterFootprint.current}L</Text>
          </View>
        </View>
        <Text style={styles.footprintImprovement}>
          {waterFootprint.initial - waterFootprint.current > 0 
            ? strings.formatString(strings.footprintImprovement, waterFootprint.initial - waterFootprint.current)
            : strings.noImprovement}
        </Text>
      </View>

      {/* Günlük İlerleme Grafiği */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>{strings.dailyProgress}</Text>
        {dailySavings?.data && dailySavings.data.length > 0 && dailySavings.data.some(value => value > 0) ? (
          <LineChart
            data={{
              labels: dailySavings.labels || [],
              datasets: [{
                data: dailySavings.data || []
              }]
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#FFF',
              backgroundGradientFrom: '#FFF',
              backgroundGradientTo: '#FFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#2196F3'
              }
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons name="chart-line" size={48} color="#CCC" />
            <Text style={styles.noDataText}>{strings.noProgressData}</Text>
          </View>
        )}
      </View>

      {/* Başarı İstatistikleri */}
      <View style={styles.achievementStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>{strings.completedChallenges}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>{strings.activeChallenges}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>85%</Text>
          <Text style={styles.statLabel}>{strings.successRate}</Text>
        </View>
      </View>

      {/* Motivasyon Mesajı */}
      <View style={styles.motivationCard}>
        <Text style={styles.motivationTitle}>{strings.keepGoing}</Text>
        <Text style={styles.motivationText}>
          {strings.motivationMessage}
        </Text>
      </View>

      {/* Geçmiş Challenge'lar */}
      <View style={styles.pastChallengesContainer}>
        <Text style={styles.sectionTitle}>{strings.pastChallenges}</Text>
        {pastChallenges.map((challenge, index) => (
          <View key={index} style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeDate}>
                {new Date(challenge.date).toLocaleDateString()}
              </Text>
              <Text style={styles.challengeSaving}>
                {challenge.totalSaving}L {strings.saved}
              </Text>
            </View>
            <View style={styles.progressDetails}>
              {/* Challenge detayları */}
            </View>
          </View>
        ))}
      </View>

      {/* Öğrenme İstatistikleri */}
      <View style={styles.learningStatsContainer}>
        <Text style={styles.sectionTitle}>{strings.learningProgress}</Text>
        <View style={styles.learningStats}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="video" size={24} color="#2196F3" />
            <Text style={styles.statNumber}>{learningStats.videos}</Text>
            <Text style={styles.statLabel}>{strings.watchedVideos}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="book-open-variant" size={24} color="#2196F3" />
            <Text style={styles.statNumber}>{learningStats.articles}</Text>
            <Text style={styles.statLabel}>{strings.readArticles}</Text>
          </View>
        </View>
      </View>

      {/* Yeniden Başlat Butonu */}
      <TouchableOpacity 
        style={styles.restartButton}
        onPress={handleRestart}
      >
        <View style={styles.restartButtonContent}>
          <MaterialCommunityIcons 
            name="restart" 
            size={24} 
            color="#FFF" 
            style={styles.restartIcon}
          />
          <Text style={styles.restartButtonText}>{strings.restartChallenge}</Text>
        </View>
      </TouchableOpacity>

      {/* Restart Dialog */}
      <RestartDialog 
        visible={showRestartDialog}
        onClose={() => setShowRestartDialog(false)}
        onConfirm={handleRestartConfirm}
      />

      {/* Debug Reset Button - Sadece development modunda göster */}
      {__DEV__ && (
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]}
          onPress={handleResetData}
        >
          <Text style={styles.resetButtonText}>{strings.resetData}</Text>
        </TouchableOpacity>
      )}

      {/* Sign Out Button */}
      <TouchableOpacity 
        style={[styles.button, styles.signOutButton]}
        onPress={handleSignOut}
      >
        <MaterialCommunityIcons name="logout" size={24} color="#666" />
        <Text style={styles.signOutButtonText}>{strings.signOut}</Text>
      </TouchableOpacity>

      {/* Dil Seçimi */}
      <View style={styles.languageSection}>
        <Text style={styles.sectionTitle}>{strings.language}</Text>
        <View style={styles.languageOptions}>
          <TouchableOpacity 
            style={[
              styles.languageButton,
              currentLanguage === 'en' && styles.languageButtonActive
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text style={[
              styles.languageButtonText,
              currentLanguage === 'en' && styles.languageButtonTextActive
            ]}>English</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.languageButton,
              currentLanguage === 'tr' && styles.languageButtonActive
            ]}
            onPress={() => handleLanguageChange('tr')}
          >
            <Text style={[
              styles.languageButtonText,
              currentLanguage === 'tr' && styles.languageButtonTextActive
            ]}>Türkçe</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Test Notification Button - Sadece development modunda göster */}
      {__DEV__ && (
        <TouchableOpacity 
          style={[styles.button, styles.testButton]}
          onPress={sendTestNotification}
        >
          <MaterialCommunityIcons name="bell-ring" size={24} color="#1976D2" />
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </TouchableOpacity>
      )}

      {/* Feedback butonu */}
      <TouchableOpacity 
        style={[styles.button, styles.feedbackButton]}
        onPress={() => setShowFeedbackModal(true)}
      >
        <MaterialCommunityIcons name="message-text" size={24} color="#1976D2" />
        <Text style={styles.feedbackButtonText}>{strings.sendFeedback}</Text>
      </TouchableOpacity>

      {/* Feedback modalı */}
      <Modal
        visible={showFeedbackModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.feedbackOverlay}>
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackTitle}>{strings.feedbackTitle}</Text>
            <TextInput
              style={styles.feedbackInput}
              multiline
              numberOfLines={4}
              placeholder={strings.feedbackPlaceholder}
              value={feedback}
              onChangeText={setFeedback}
            />
            <View style={styles.feedbackButtons}>
              <TouchableOpacity 
                style={[styles.feedbackButton, styles.cancelButton]}
                onPress={() => setShowFeedbackModal(false)}
              >
                <Text style={styles.cancelButtonText}>{strings.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.feedbackButton, styles.sendButton]}
                onPress={handleSendFeedback}
              >
                <Text style={styles.sendButtonText}>{strings.send}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  savingAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  savingDescription: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  achievementStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  motivationCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  pastChallengesContainer: {
    marginTop: 24,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeDate: {
    fontSize: 16,
    color: '#666',
  },
  challengeSaving: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  restartButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 32,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  restartButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartIcon: {
    marginRight: 8,
  },
  restartButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dialogButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  learningStatsContainer: {
    marginTop: 24,
  },
  learningStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  limitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  limitText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1976D2',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  noDataText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  resetButton: {
    backgroundColor: '#FFE0E0',
  },
  resetButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#F5F5F5',
  },
  signOutButtonText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  languageSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  languageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
    backgroundColor: '#FFF',
  },
  languageButtonActive: {
    backgroundColor: '#2196F3',
  },
  languageButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  languageButtonTextActive: {
    color: '#FFF',
  },
  testButton: {
    backgroundColor: '#E3F2FD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  testButtonText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  feedbackOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  feedbackContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedbackButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#2196F3',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackButtonText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footprintCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footprintComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  footprintItem: {
    flex: 1,
    alignItems: 'center',
  },
  footprintLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footprintValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  footprintImprovement: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
  },
  chartContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  }
}); 