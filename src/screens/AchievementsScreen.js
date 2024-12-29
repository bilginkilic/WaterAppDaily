import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StorageService } from '../services/storage';
import strings from '../localization/strings';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { categories } from '../data/categories';

export const AchievementsScreen = () => {
  const [achievements, setAchievements] = useState([]);
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const savedAchievements = await StorageService.getAchievements();
    console.log('Loaded achievements:', savedAchievements);
    if (savedAchievements) {
      // Tarihe göre sırala - en yeniden en eskiye
      const sortedAchievements = savedAchievements.sort((a, b) => 
        new Date(b.date || Date.now()) - new Date(a.date || Date.now())
      );
      setAchievements(sortedAchievements);

      // Toplam tasarrufu hesapla
      const total = sortedAchievements.reduce((acc, achievement) => 
        acc + (achievement.improvement || 0), 0);
      setTotalSaved(total);
    }
  };

  const getAchievementIcon = (category) => {
    switch (category) {
      case 'dishwashing': return 'dishwasher';
      case 'shower': return 'shower';
      case 'laundry': return 'washing-machine';
      case 'plumbing': return 'water-pump';
      case 'daily': return 'calendar-check';
      case 'car': return 'car-wash';
      default: return 'water';
    }
  };

  const getCategoryColor = (categoryId) => {
    const category = Object.values(categories).find(c => c.id === categoryId);
    return category?.color || '#2196F3';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Özet Kartı */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>{strings.achievements}</Text>
        <View style={styles.badgesContainer}>
          <View style={styles.badgeItem}>
            <Text style={styles.badgeNumber}>{achievements.length}</Text>
            <Text style={styles.badgeLabel}>{strings.unlockedBadges}</Text>
          </View>
          <View style={styles.badgeItem}>
            <Text style={styles.badgeNumber}>{totalSaved}L</Text>
            <Text style={styles.badgeLabel}>{strings.totalWaterSaved}</Text>
          </View>
        </View>
      </View>

      {/* Başarılar Listesi */}
      <View style={styles.achievementsContainer}>
        <Text style={styles.sectionTitle}>{strings.recentAchievements}</Text>
        {achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementCard}>
            <View style={[
              styles.iconContainer, 
              { backgroundColor: getCategoryColor(achievement.category) }
            ]}>
              <MaterialCommunityIcons 
                name={getAchievementIcon(achievement.category)} 
                size={24} 
                color="#FFF" 
              />
            </View>
            <View style={styles.achievementContent}>
              <View style={styles.achievementHeader}>
                <Text style={styles.achievementTitle}>
                  {categories[achievement.category]?.title || achievement.category}
                </Text>
                <Text style={styles.achievementDate}>
                  {new Date(achievement.date || Date.now()).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.achievementMessage}>
                {achievement.message}
              </Text>
              <View style={styles.savingContainer}>
                <MaterialCommunityIcons name="water" size={16} color="#2196F3" />
                <Text style={styles.savingText}>
                  {strings.formatString(strings.savedWater, achievement.improvement)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  summaryContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  badgeItem: {
    alignItems: 'center',
  },
  badgeNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  badgeLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  achievementsContainer: {
    padding: 20,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
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
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  achievementDate: {
    fontSize: 12,
    color: '#666',
  },
  achievementMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingText: {
    fontSize: 14,
    color: '#2196F3',
    marginLeft: 4,
    fontWeight: '500',
  },
}); 