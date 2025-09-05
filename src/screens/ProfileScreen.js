import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import strings from '../localization/strings';
import DataService from '../services/DataService';
import { useAuth } from '../context/AuthContext';
import StorageService from '../services/StorageService';

export const ProfileScreen = () => {
  const navigation = useNavigation();
  const { signOut: authSignOut, token } = useAuth();
  const [waterFootprint, setWaterFootprint] = useState(0);
  const [initialWaterFootprint, setInitialWaterFootprint] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [currentFootprint, initialFootprint, tasksData, achievementsData] = await Promise.all([
          DataService.getCurrentWaterFootprint(),
          DataService.InitialWaterFootPrint(),
          DataService.getTasks(),
          DataService.getAchievements()
        ]);

        setWaterFootprint(currentFootprint);
        setInitialWaterFootprint(initialFootprint);
        setTasks(tasksData);
        setAchievements(achievementsData);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  const totalPotentialSaving = tasks.reduce((total, task) => total + (task.valueSaving || 0), 0);

  const handleSignOut = async () => {
    try {
      if (navigation) {
        // Navigate first
        navigation.replace('Auth', { screen: 'Login' });
        // Then clear data
        await authSignOut();
        await DataService.clearUserData();
      }
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      strings.deleteAccountConfirmTitle,
      strings.deleteAccountConfirmMessage,
      [
        {
          text: strings.cancel,
          style: 'cancel',
        },
        {
          text: strings.confirm,
          style: 'destructive',
          onPress: async () => {
            try {
              const userData = await DataService.getUserData();
              if (userData?.userId && navigation) {
                navigation.replace('Auth', { screen: 'Login' });
                await StorageService.deleteAccount(userData.userId);
                await DataService.clearUserData();
                await authSignOut();
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Current Water Footprint</Text>
            <Text style={styles.waterFootprint}>{waterFootprint}L</Text>
            
            <View style={styles.savingContainer}>
              <Text style={styles.savingTitle}>Potential Monthly Saving</Text>
              <Text style={styles.savingAmount}>{totalPotentialSaving}L</Text>
              <Text style={styles.savingNote}>Based on your current tasks</Text>
            </View>

            <View style={styles.savingContainer}>
              <Text style={styles.savingTitle}>Initial Water Footprint</Text>
              <Text style={styles.savingAmount}>{initialWaterFootprint}L</Text>
              <Text style={styles.savingNote}>Your starting water footprint</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{tasks.length}</Text>
              <Text style={styles.statLabel}>Active Tasks</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{achievements.length}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            {token ? (
              <>
                <TouchableOpacity
                  style={styles.signOutButton}
                  onPress={handleSignOut}
                >
                  <Text style={styles.signOutButtonText}>{strings.signOut}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteAccountButton}
                  onPress={handleDeleteAccount}
                >
                  <Text style={styles.deleteAccountButtonText}>{strings.deleteAccount}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.signOutButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => {
                  if (navigation) {
                    navigation.replace('Auth', { screen: 'Login' });
                  }
                }}
              >
                <Text style={styles.signOutButtonText}>Login to Sync Your Progress</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    backgroundColor: '#F0F9FF',
  },
  content: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  waterFootprint: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  savingContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E3F2FD',
  },
  savingTitle: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 8,
  },
  savingAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  savingNote: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 24,
    gap: 16,
  },
  signOutButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteAccountButton: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DC3545',
  },
  deleteAccountButtonText: {
    color: '#DC3545',
    fontSize: 16,
    fontWeight: '600',
  },
}); 