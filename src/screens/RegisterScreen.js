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
import { useAuth } from '../context/AuthContext';

export const RegisterScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Register the user
      const response = await StorageService.register(email, password, name);
      console.log('Registration response:', response);

      // Automatically log in after successful registration
      const loginResponse = await StorageService.login(email, password);

      // Set auth context
      await signIn(loginResponse.token, {
        id: loginResponse.userId,
        email: email,
        name: name
      });

      // After successful registration and login, AppStack will automatically show Intro screen
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message.includes('already exists')) {
        Alert.alert(
          'Registration Failed',
          'This email is already registered. Please use a different email address or login with your existing account.'
        );
      } else {
        Alert.alert(
          'Registration Failed',
          error.message || 'Please check your information and try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{strings.createAccount}</Text>
        <Text style={styles.subtitle}>{strings.registerSubtitle}</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder={strings.name}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder={strings.email}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder={strings.password}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.registerButtonText}>{strings.register}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.loginText}>{strings.alreadyHaveAccount}</Text>
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
  registerButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
});
