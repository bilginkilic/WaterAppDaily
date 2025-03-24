import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import strings from '../localization/strings';
import { LineChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StorageService } from '../services';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://waterappdashboard2.onrender.com/api';

export const ProfileScreen = ({ route, navigation }) => {
  const { user, token, signOut } = useAuth();
  const [totalSavings, setTotalSavings] = useState(0);
  const [dailySavings, setDailySavings] = useState({
    labels: [],
    data: []
  });
  const [waterFootprint, setWaterFootprint] = useState({
    initial: 0,
    current: 0,
    potentialSaving: 0
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

      // Yerel depolamadan su ayak izi verilerini yükle
      const waterProfile = await AsyncStorage.getItem('userWaterProfile');
      if (waterProfile) {
        const profile = JSON.parse(waterProfile);
        setWaterFootprint({
          initial: profile.initialWaterprint,
          current: profile.dailyUsage,
          potentialSaving: profile.potentialSaving
        });
      }

      // API'den ilerleme verilerini al
      const response = await fetch(`${API_URL}/waterprint/progress/${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('İlerleme verileri alınamadı');
      }

      const data = await response.json();
      console.log('Progress data:', data);

      // İlerleme verilerini işle
      if (data.progressHistory && data.progressHistory.length > 0) {
        const labels = data.progressHistory.map(item => 
          new Date(item.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
        );
        const values = data.progressHistory.map(item => item.waterprint);

        setDailySavings({
          labels: labels.slice(-7), // Son 7 gün
          data: values.slice(-7)
        });

        // Toplam tasarruf
        if (data.waterprintReduction) {
          setTotalSavings(data.waterprintReduction);
        }

        // Güncel su ayak izi
        if (data.currentWaterprint) {
          setWaterFootprint(prev => ({
            ...prev,
            current: data.currentWaterprint
          }));
        }
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Merhaba, {user?.name || 'Kullanıcı'}</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <MaterialCommunityIcons name="logout" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Başlangıç Su Ayak İzi</Text>
              <Text style={styles.statValue}>
                {(waterFootprint.initial || 0).toFixed(1)} L
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Güncel Su Ayak İzi</Text>
              <Text style={styles.statValue}>
                {(waterFootprint.current || 0).toFixed(1)} L
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Toplam Tasarruf</Text>
              <Text style={styles.statValue}>
                {(totalSavings || 0).toFixed(1)} L
              </Text>
            </View>
          </View>

          {dailySavings.labels.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Son 7 Günlük Su Tüketimi</Text>
              <LineChart
                data={{
                  labels: dailySavings.labels,
                  datasets: [{
                    data: dailySavings.data
                  }]
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
            </View>
          )}

          <View style={styles.potentialContainer}>
            <MaterialCommunityIcons name="water-percent" size={24} color="#2196F3" />
            <Text style={styles.potentialText}>
              Potansiyel Tasarruf: {(waterFootprint.potentialSaving || 0).toFixed(1)} L/gün
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  signOutButton: {
    padding: 8,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'column',
    padding: 20,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    margin: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  potentialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    margin: 20,
    padding: 16,
    borderRadius: 16,
  },
  potentialText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1976D2',
  },
}); 