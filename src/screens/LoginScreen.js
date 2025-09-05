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
  Linking,
} from 'react-native';
import strings from '../localization/strings';
import DataService from '../services/DataService';
import { useAuth } from '../context/AuthContext';
import StorageService from '../services/StorageService';

export const LoginScreen = ({ navigation }) => {
  const { signIn, startAnonymousSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      // StorageService üzerinden giriş yap
      const response = await StorageService.login(email, password);
      console.log('Login response:', response);

      // AuthContext'e giriş bilgilerini kaydet
      await signIn(response.token, {
        id: response.userId,
        email: email,
        name: response.name || email.split('@')[0]
      });

      // Kullanıcının survey durumunu kontrol et
      const existingUserData = await DataService.getUserData();
      const isSurveyTaken = existingUserData?.surveyTaken || false;
      
      // After successful login, navigate based on survey status
      console.log('Login successful, survey status:', isSurveyTaken);
      if (isSurveyTaken) {
        navigation.replace('MainApp', {
          screen: 'Main',
          params: {
            screen: 'Challenges'
          }
        });
      } else {
        navigation.replace('MainApp', {
          screen: 'Intro'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error.message || 'Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{strings.welcome}</Text>
        <Text style={styles.subtitle}>{strings.slogan}</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            You can use the app without logging in to track your personal water footprint. Login is only required to participate in global challenges and competitions that will be announced at{' '}
            <Text style={styles.linkText} onPress={() => Linking.openURL('https://waterapp2.lovable.app')}>
              waterapp2.lovable.app
            </Text>
          </Text>
        </View>

        <View style={styles.form}>
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
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginButtonText}>{strings.login}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>{strings.forgotPassword}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>{strings.register}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity 
            style={styles.skipButton}
            onPress={async () => {
              try {
                await startAnonymousSession();
                // After anonymous session, navigate to Survey directly
                navigation.replace('Survey');
              } catch (error) {
                Alert.alert('Error', 'Failed to start anonymous session');
              }
            }}
          >
            <Text style={styles.skipButtonText}>Start Calculating Your Water Footprint</Text>
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
  loginButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#2196F3',
    fontSize: 14,
  },
  registerButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E3E3E3',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  skipButton: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'center',
  },
  linkText: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
}); 