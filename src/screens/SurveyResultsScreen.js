import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import strings from '../localization/strings';
import { categories, categoryIds } from '../data/categories';

const { width } = Dimensions.get('window');

export const SurveyResultsScreen = ({ route, navigation }) => {
  const { results } = route.params;
  
  // Kategori eşleştirme map'i
  const categoryMapping = {
    'Dishwashing': categoryIds.DISHWASHING,
    'Shower': categoryIds.SHOWER,
    'Laundry': categoryIds.LAUNDRY,
    'Plumbing': categoryIds.PLUMBING,
    'Daily activities': categoryIds.DAILY,
    'Car owners': categoryIds.CAR,
    // Alternatif yazımlar için de eşleştirme ekleyelim
    'daily-activities': categoryIds.DAILY,
    'car-owners': categoryIds.CAR,
    'daily': categoryIds.DAILY,
    'car': categoryIds.CAR
  };

  // Improvement gereken kategorileri belirle
  const improvementAreas = results.tasks.reduce((acc, task) => {
    if (task && task.category) {
      const normalizedCategory = categoryMapping[task.category] || task.category;
      if (!acc.includes(normalizedCategory)) {
        acc.push(normalizedCategory);
      }
    }
    return acc;
  }, []);

  console.log('Improvement Areas:', improvementAreas); // Debug için

  const handleStartChallenge = () => {
    navigation.navigate('Challenges', { 
      improvementAreas: improvementAreas 
    });
  };

  // Su tasarrufu yüzdesini hesapla
  const savingPercentage = ((results.totalSaving / results.totalUsage) * 100).toFixed(1);
  
  // Kategorilere göre görevleri grupla
  const tasksByCategory = results.tasks.reduce((acc, task) => {
    const category = task.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(task);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Başlık ve Özet */}
        <View style={styles.summaryContainer}>
          <Text style={styles.title}>{strings.surveyComplete}</Text>
          <Text style={styles.subtitle}>
            {strings.formatString(strings.waterSavingPotential, savingPercentage)}
          </Text>
        </View>

        {/* İstatistikler */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.statValue}>{results.totalSaving}L</Text>
            <Text style={styles.statLabel}>{strings.potentialSaving}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#E1F5FE' }]}>
            <Text style={styles.statValue}>{results.totalUsage}L</Text>
            <Text style={styles.statLabel}>{strings.currentUsage}</Text>
          </View>
        </View>

        {/* Başarılar */}
        {results.achievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.achievements}</Text>
            <View style={styles.achievementsContainer}>
              {results.achievements.map((achievement, index) => (
                <View key={index} style={styles.achievementCard}>
                  <Text style={styles.achievementText}>{achievement.text}</Text>
                  <Text style={styles.achievementCategory}>{achievement.category}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* İyileştirme Alanları */}
        {Object.entries(tasksByCategory).map(([category, tasks]) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {strings.formatString(strings.improvementArea, category)}
            </Text>
            {tasks.map((task, index) => (
              <View key={index} style={styles.taskCard}>
                <Text style={styles.taskText}>{task.text}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Challenge Başlatma */}
        <View style={styles.challengeContainer}>
          <Text style={styles.challengeTitle}>{strings.readyForChallenge}</Text>
          <Text style={styles.challengeDescription}>
            {strings.challengeDescription}
          </Text>
          <TouchableOpacity 
            style={styles.startChallengeButton}
            onPress={handleStartChallenge}
          >
            <Text style={styles.buttonText}>{strings.startChallenge}</Text>
          </TouchableOpacity>
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
  content: {
    padding: 20,
  },
  summaryContainer: {
    alignItems: 'center',
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
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statBox: {
    width: width * 0.42,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementCard: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  achievementText: {
    fontSize: 16,
    color: '#2E7D32',
  },
  taskCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  taskText: {
    fontSize: 16,
    color: '#E65100',
  },
  challengeContainer: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
    lineHeight: 22,
  },
  startChallengeButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  achievementCategory: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
}); 