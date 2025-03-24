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
      setError('User information not found');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load water footprint data from local storage
      const waterProfile = await AsyncStorage.getItem('userWaterProfile');
      if (waterProfile) {
        const profile = JSON.parse(waterProfile);
        setWaterFootprint({
          initial: profile.initialWaterprint,
          current: profile.dailyUsage,
          potentialSaving: profile.potentialSaving
        });
      }

      // Get progress data from API
      const response = await fetch(`${API_URL}/waterprint/progress/${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Could not retrieve progress data');
      }

      const data = await response.json();
      console.log('Progress data:', data);

      // Process progress data
      if (data.progressHistory && data.progressHistory.length > 0) {
        const labels = data.progressHistory.map(item => 
          new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
        );
        const values = data.progressHistory.map(item => item.waterprint);

        setDailySavings({
          labels: labels.slice(-7), // Last 7 days
          data: values.slice(-7)
        });

        // Total savings
        if (data.waterprintReduction) {
          setTotalSavings(data.waterprintReduction);
        }

        // Current water footprint
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
      Alert.alert('Error', 'An error occurred while signing out');
    }
  };

  // Calculate water footprint reduction percentage
  const calculateReductionPercentage = () => {
    if (!waterFootprint.initial || waterFootprint.initial === 0) return 0;
    const reduction = waterFootprint.initial - waterFootprint.current;
    return Math.round((reduction / waterFootprint.initial) * 100);
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
        <Text style={styles.welcomeText}>Hello, {user?.name || 'User'}</Text>
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
          {/* Water Footprint Summary Card */}
          <View style={styles.waterFootprintCard}>
            <Text style={styles.waterFootprintTitle}>Your Water Footprint</Text>
            <View style={styles.waterFootprintContent}>
              <View style={styles.percentageContainer}>
                <Text style={styles.percentageValue}>{calculateReductionPercentage()}%</Text>
                <Text style={styles.percentageLabel}>Reduction</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.footprintDetails}>
                <View style={styles.footprintItem}>
                  <Text style={styles.footprintItemLabel}>Initial</Text>
                  <Text style={styles.footprintItemValue}>{(waterFootprint.initial || 0).toFixed(1)}L</Text>
                </View>
                <View style={styles.footprintItem}>
                  <Text style={styles.footprintItemLabel}>Current</Text>
                  <Text style={[
                    styles.footprintItemValue, 
                    styles.currentValue
                  ]}>{(waterFootprint.current || 0).toFixed(1)}L</Text>
                </View>
                <View style={styles.footprintItem}>
                  <Text style={styles.footprintItemLabel}>Saved</Text>
                  <Text style={[
                    styles.footprintItemValue, 
                    styles.savedValue
                  ]}>{(totalSavings || 0).toFixed(1)}L</Text>
                </View>
              </View>
            </View>
          </View>

          {dailySavings.labels.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Water Usage - Last 7 Days</Text>
              <LineChart
                data={{
                  labels: dailySavings.labels,
                  datasets: [{
                    data: dailySavings.data,
                    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                    strokeWidth: 2
                  }]
                }}
                width={Dimensions.get('window').width - 40}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#2196F3"
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
              Potential Savings: {(waterFootprint.potentialSaving || 0).toFixed(1)} L/day
            </Text>
          </View>
          
          {/* How Water Footprint Works Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>How Your Water Footprint is Calculated</Text>
            <Text style={styles.infoText}>
              Your water footprint is calculated based on your responses to the survey questions. Each time you complete a challenge task, your water footprint is recalculated based on your new water usage habits.
            </Text>
            <View style={styles.infoPoint}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#4CAF50" />
              <Text style={styles.infoPointText}>The more challenges you complete, the more your water footprint decreases</Text>
            </View>
            <View style={styles.infoPoint}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#4CAF50" />
              <Text style={styles.infoPointText}>Each achievement represents a sustainable water-saving habit you've adopted</Text>
            </View>
            <View style={styles.infoPoint}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#4CAF50" />
              <Text style={styles.infoPointText}>Progress is tracked and synced with our servers to maintain your data across devices</Text>
            </View>
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
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  waterFootprintCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  waterFootprintTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  waterFootprintContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  percentageContainer: {
    alignItems: 'center',
    padding: 12,
  },
  percentageValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  percentageLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E0E0E0',
  },
  footprintDetails: {
    flex: 1,
    marginLeft: 20,
  },
  footprintItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  footprintItemLabel: {
    fontSize: 14,
    color: '#666',
  },
  footprintItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  currentValue: {
    color: '#2196F3',
  },
  savedValue: {
    color: '#4CAF50',
  },
  chartContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  potentialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  potentialText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoPointText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  }
}); 