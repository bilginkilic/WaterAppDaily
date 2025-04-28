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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StorageService } from '../services';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://waterappdashboard2.onrender.com/api';

export const ProfileScreen = ({ route, navigation }) => {
  const { user, token, signOut } = useAuth();
  const [totalSavings, setTotalSavings] = useState(0);
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
          current: profile.dailyUsage
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  signOutButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FFEBEE',
    margin: 20,
    borderRadius: 12,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
  },
  waterFootprintCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  waterFootprintTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  waterFootprintContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  percentageValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  percentageLabel: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#E3F2FD',
    marginRight: 20,
  },
  footprintDetails: {
    flex: 1,
  },
  footprintItem: {
    marginBottom: 8,
  },
  footprintItemLabel: {
    fontSize: 14,
    color: '#666',
  },
  footprintItemValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  currentValue: {
    color: '#2196F3',
  },
  savedValue: {
    color: '#4CAF50',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoCardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  infoPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoPointText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
}); 