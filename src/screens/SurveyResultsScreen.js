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
import { categories } from '../data/categories';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export const SurveyResultsScreen = ({ route, navigation }) => {
  const { results } = route.params;
  
  // Improvement gereken kategorileri belirle
  const improvementAreas = results.tasks.reduce((acc, task) => {
    if (task?.category && !acc.includes(task.category)) {
      acc.push(task.category);
    }
    return acc;
  }, []);

  // Debug için log ekleyelim
  console.log('Categories:', categories);
  console.log('Improvement Areas:', improvementAreas);

  // Sadece geçerli kategorileri gösterelim
  const validImprovementAreas = improvementAreas.filter(categoryId => 
    categories[categoryId] && categories[categoryId].title
  );

  const handleStartChallenge = () => {
    console.log('Starting challenge with areas:', improvementAreas);
    navigation.reset({
      index: 0,
      routes: [{ 
        name: 'Main',
        params: { 
          improvementAreas: improvementAreas,
          screen: 'Challenges',
          isFirstTime: true
        }
      }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Başlık ve Özet */}
        <View style={styles.header}>
          <View style={styles.confettiContainer}>
            <MaterialCommunityIcons name="party-popper" size={32} color="#2196F3" />
          </View>
          <Text style={styles.title}>{strings.surveyComplete}</Text>
          <View style={styles.savingCard}>
            <Text style={styles.savingText}>
              {strings.waterSavingPotential}
            </Text>
            <Text style={styles.savingPercentage}>
              {((results.totalSaving / results.totalUsage) * 100).toFixed(0)}%
            </Text>
            <Text style={styles.savingDescription}>
              {strings.savingPercentageText}
            </Text>
            <Text style={styles.savingSubtext}>
              {strings.formatString(strings.savingEquivalent, '2 days')}
            </Text>
          </View>
        </View>

        {/* Geliştirilmesi Gereken Alanlar */}
        <View style={styles.areasContainer}>
          <Text style={styles.sectionTitle}>{strings.improvementAreas}</Text>
          <Text style={styles.explanationText}>
            {strings.formatString(strings.areasExplanation, validImprovementAreas.length)}
          </Text>
          {validImprovementAreas.map((categoryId) => (
            <View key={categoryId} style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: categories[categoryId].color }]}>
                <MaterialCommunityIcons 
                  name={categories[categoryId].icon || 'water'} 
                  size={24} 
                  color="#FFF" 
                />
              </View>
              <View style={styles.categoryContent}>
                <Text style={styles.categoryTitle}>
                  {categories[categoryId].title}
                </Text>
                <View style={styles.improvementBadge}>
                  <Text style={styles.improvementText}>{strings.needsImprovement}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Challenge Açıklaması */}
        <View style={styles.challengeInfoContainer}>
          <MaterialCommunityIcons name="lightbulb-on" size={24} color="#1976D2" />
          <Text style={styles.challengeInfoText}>
            {strings.challengeInfo}
          </Text>
        </View>

        {/* Challenge Başlatma */}
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartChallenge}
        >
          <MaterialCommunityIcons name="flag-checkered" size={24} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.startButtonText}>{strings.startChallenge}</Text>
        </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  confettiContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 16,
    textAlign: 'center',
  },
  savingCard: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  savingPercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  savingText: {
    fontSize: 16,
    color: '#1976D2',
    textAlign: 'center',
  },
  savingDescription: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    marginTop: 4,
  },
  savingSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  areasContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  improvementBadge: {
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  improvementText: {
    color: '#F57C00',
    fontSize: 12,
    fontWeight: '500',
  },
  challengeInfoContainer: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeInfoText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#1976D2',
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  buttonIcon: {
    marginRight: 12,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
}); 