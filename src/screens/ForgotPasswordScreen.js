import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import strings from '../localization/strings';
import StorageService from '../services/StorageService';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      await StorageService.forgotPassword(email);
      Alert.alert(
        'Success',
        strings.resetEmailSent,
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to send password reset email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{strings.resetPassword}</Text>
        <Text style={styles.subtitle}>{strings.resetPasswordSubtitle}</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder={strings.email}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.resetButtonText}>{strings.sendResetInstructions}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{strings.backToLogin}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
  },
});
