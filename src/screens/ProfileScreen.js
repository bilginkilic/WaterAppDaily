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

export const ProfileScreen = ({ route, navigation }) => {
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedAchievements = await StorageService.getAchievements() || [];
      const initialSurvey = await StorageService.getInitialSurvey() || {};
      const surveyResults = await StorageService.getSurveyResults() || {};
      
      // İlk su ayak izi survey sonucundan al
      const initialFootprint = surveyResults.totalUsage || 0;
      
      // Toplam tasarrufu hesapla
      const total = savedAchievements.reduce((acc, achievement) => 
        acc + (achievement.improvement || 0), 0);
      
      // Güncel su ayak izi = İlk değer - Toplam tasarruf
      const currentFootprint = Math.max(0, initialFootprint - total);
      
      setWaterFootprint({
        initial: initialFootprint,
        current: currentFootprint
      });

      setTotalSavings(total);

      // Günlük tasarrufları hesapla
      const dailyData = calculateDailySavings(savedAchievements);
      setDailySavings(dailyData);

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

  return (
    <ScrollView style={styles.container}>
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
        onPress={handleRestart}
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
}); 