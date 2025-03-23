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

const formatWaterVolume = (liters) => {
  if (liters >= 1000) {
    return `${(liters / 1000).toFixed(1)} m³`;
  }
  return `${Math.round(liters)} L`;
};

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
    console.log('Valid improvement areas:', validImprovementAreas);
    
    // Direkt Main ekranına git
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Main',
          params: {
            improvementAreas: validImprovementAreas,
            screen: 'Challenges'
          }
        }
      ]
    });
  };

  // Su tüketim ve tasarruf değerlerini hesapla
  const dailyUsage = results.totalUsage;
  const potentialSaving = results.totalSaving;
  const savingPercentage = Math.min(Math.round((potentialSaving / dailyUsage) * 100), 100);
  
  // Yıllık tasarruf potansiyelini hesapla
  const yearlyPotentialSaving = potentialSaving * 365;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Başlık ve Özet */}
        <View style={styles.header}>
          <View style={styles.confettiContainer}>
            <MaterialCommunityIcons name="party-popper" size={32} color="#2196F3" />
          </View>
          <Text style={styles.title}>{strings.surveyComplete}</Text>
        </View>

        {/* Su Tüketim Özeti */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Günlük Su Tüketiminiz</Text>
          <Text style={styles.usageAmount}>{formatWaterVolume(dailyUsage)}</Text>
          <View style={styles.divider} />
          <Text style={styles.savingTitle}>Tasarruf Potansiyeli</Text>
          <Text style={styles.savingAmount}>{formatWaterVolume(potentialSaving)}</Text>
          <Text style={styles.savingPerDay}>günlük</Text>
          <View style={styles.yearlyContainer}>
            <Text style={styles.yearlyLabel}>Yıllık potansiyel tasarruf:</Text>
            <Text style={styles.yearlyAmount}>{formatWaterVolume(yearlyPotentialSaving)}</Text>
          </View>
        </View>

        {/* Geliştirilmesi Gereken Alanlar */}
        <View style={styles.areasContainer}>
          <Text style={styles.sectionTitle}>İyileştirme Alanları</Text>
          <Text style={styles.explanationText}>
            Aşağıdaki alanlarda yapacağınız değişikliklerle su tüketiminizi azaltabilirsiniz:
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
                <Text style={styles.categoryDescription}>
                  {categories[categoryId].description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Challenge Açıklaması */}
        <View style={styles.challengeInfoContainer}>
          <MaterialCommunityIcons name="lightbulb-on" size={24} color="#1976D2" />
          <Text style={styles.challengeInfoText}>
            30 günlük su tasarrufu meydan okumasına katılarak, alışkanlıklarınızı değiştirin
            ve gerçek tasarruf potansiyelinizi keşfedin.
          </Text>
        </View>

        {/* Challenge Başlatma */}
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartChallenge}
        >
          <MaterialCommunityIcons name="flag-checkered" size={24} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.startButtonText}>Meydan Okumayı Başlat</Text>
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
    marginBottom: 24,
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  usageAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    width: '80%',
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  savingTitle: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 8,
  },
  savingAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  savingPerDay: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 16,
  },
  yearlyContainer: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  yearlyLabel: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 4,
  },
  yearlyAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
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
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  challengeInfoContainer: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  buttonIcon: {
    marginRight: 8,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
}); 