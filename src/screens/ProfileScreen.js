import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import strings from '../localization/strings';
import { LineChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StorageService } from '../services';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://waterappdashboard2.onrender.com/api';

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
  const { user, token, signOut } = useAuth();
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [totalSavings, setTotalSavings] = useState(0);
  const [dailySavings, setDailySavings] = useState({
    labels: [],
    data: []
  });
  const [waterFootprint, setWaterFootprint] = useState({
    initial: 0,
    current: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [user, token]);

  const loadData = async () => {
    if (!user?.id || !token) {
      setError('Kullanıcı bilgileri bulunamadı');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Yerel depolamadan verileri yükle
      const savedAchievements = await StorageService.getAchievements() || [];
      const initialSurvey = await StorageService.getInitialSurvey() || {};
      const surveyResults = await StorageService.getSurveyResults() || {};
      
      console.log('Local data loaded:', { savedAchievements, initialSurvey, surveyResults });

      // API'den ilerleme verilerini al
      const response = await fetch(`${API_URL}/waterprint/progress/${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'İlerleme verileri alınamadı');
      }

      const progressData = await response.json();
      console.log('Progress data:', progressData);
      
      // Su ayak izi verilerini güncelle
      const initialWaterprint = progressData.initialWaterprint || surveyResults.totalUsage || 0;
      const currentWaterprint = progressData.currentWaterprint || Math.max(0, initialWaterprint - totalSavings) || 0;

      setWaterFootprint({
        initial: initialWaterprint,
        current: currentWaterprint
      });

      // Toplam tasarrufu hesapla
      const total = progressData.waterprintReduction || 
        savedAchievements.reduce((acc, achievement) => acc + (achievement.improvement || 0), 0);
      setTotalSavings(total);

      // Günlük tasarrufları hesapla
      const dailyData = calculateDailySavings(progressData.progressHistory || savedAchievements);
      setDailySavings(dailyData);

    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message || 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
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

  const handleRestart = () => {
    setShowRestartDialog(true);
  };

  const handleRestartConfirm = async () => {
    try {
      await StorageService.clearCurrentProgress();
      setShowRestartDialog(false);
      navigation.replace('Survey');
    } catch (error) {
      console.error('Error restarting:', error);
      Alert.alert(strings.error, strings.errorMessage);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FF5252" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profil Kartı */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.name ? user.name[0].toUpperCase() : '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#FF5252" />
          <Text style={styles.signOutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      {/* Su Ayak İzi Kartı */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Su Ayak İzi</Text>
        <View style={styles.footprintContainer}>
          <View style={styles.footprintItem}>
            <Text style={styles.footprintLabel}>İlk Kullanım</Text>
            <Text style={[styles.footprintValue, styles.initialValue]}>
              {Math.round(waterFootprint.initial)}L
            </Text>
          </View>
          <View style={styles.footprintItem}>
            <Text style={styles.footprintLabel}>Şu Anki Kullanım</Text>
            <Text style={[styles.footprintValue, styles.currentValue]}>
              {Math.round(waterFootprint.current)}L
            </Text>
          </View>
        </View>
      </View>

      {/* Günlük Su Tasarrufu Grafiği */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{strings.dailyWaterSavings}</Text>
        {dailySavings.data.length > 0 ? (
          <LineChart
            data={{
              labels: dailySavings.labels,
              datasets: [{ data: dailySavings.data }]
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            style={styles.chart}
            bezier
          />
        ) : (
          <Text style={styles.noDataText}>{strings.noSavingsData}</Text>
        )}
      </View>

      {/* Yeniden Başlat Butonu */}
      <TouchableOpacity
        style={styles.restartButton}
        onPress={() => setShowRestartDialog(true)}
      >
        <MaterialCommunityIcons name="restart" size={24} color="#fff" />
        <Text style={styles.restartButtonText}>{strings.restartChallenge}</Text>
      </TouchableOpacity>

      <RestartDialog
        visible={showRestartDialog}
        onClose={() => setShowRestartDialog(false)}
        onConfirm={handleRestartConfirm}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  footprintContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  footprintItem: {
    alignItems: 'center',
  },
  footprintLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footprintValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  initialValue: {
    color: '#1976D2',
  },
  currentValue: {
    color: '#4CAF50',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginVertical: 20,
  },
  restartButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
  },
  restartButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 16,
  },
  dialogMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
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
    textAlign: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E3F2FD',
    marginTop: 16,
  },
  signOutText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 