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
} from 'react-native';
import strings from '../localization/strings';
import { LineChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StorageService } from '../services';

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

export const ProfileScreen = ({ navigation }) => {
  const [pastChallenges, setPastChallenges] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [learningStats, setLearningStats] = useState({
    videos: 0,
    articles: 0
  });
  const [activeChallenges, setActiveChallenges] = useState(0);
  const maxChallenges = 2; // Maximum izin verilen challenge sayısı

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const savedAchievements = await StorageService.getAchievements();
    const currentProgress = await StorageService.getProgress();
    
    // Aktif challenge sayısını hesapla
    const activeCount = Object.values(currentProgress || {})
      .filter(p => !p.completed).length;
    setActiveChallenges(activeCount);

    if (savedAchievements) {
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
      const active = improvementAreas?.length || 0;
      const successRate = active > 0 ? Math.round((completed / active) * 100) : 0;

      setStats({
        completed,
        active,
        successRate
      });
    }
  };

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
      <View style={styles.limitCard}>
        <MaterialCommunityIcons name="information" size={24} color="#1976D2" />
        <Text style={styles.limitText}>
          {strings.formatString(strings.challengeLimit, activeChallenges, maxChallenges)}
        </Text>
      </View>

      {/* İstatistikler */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>{strings.progressOverTime}</Text>
        {pastChallenges.length > 0 ? (
          <LineChart
            data={waterSavingData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
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
}); 