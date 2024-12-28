import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import strings from '../localization/strings';

export const MainScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>{strings.surveyIntro}</Text>
          <Text style={styles.welcomeText}>
            {strings.surveyDescription}
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>1</Text>
            <Text style={styles.cardText}>{strings.cardOne}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>2</Text>
            <Text style={styles.cardText}>{strings.cardTwo}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>3</Text>
            <Text style={styles.cardText}>{strings.cardThree}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => navigation.navigate('Survey')}
        >
          <Text style={styles.startButtonText}>{strings.startSurvey}</Text>
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
  welcomeContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  cardContainer: {
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginRight: 15,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  startButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
}); 