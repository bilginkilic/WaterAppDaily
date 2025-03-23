import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import strings from '../localization/strings';
import { StorageService } from '../services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://waterappdashboard2.onrender.com/api';

export const LoginScreen = ({ route, navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  React.useEffect(() => {
    const autoLogin = async () => {
      if (route.params?.shouldAutoLogin) {
        const { improvementAreas, initialScreen } = route.params;
        setIsLoading(true);
        
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'test123456',
            }),
          });

          const data = await response.json();
          
          if (response.status !== 200 || !data.token || !data.userId) {
            throw new Error('Login failed');
          }

          const user = {
            id: data.userId,
            name: 'Test User',
            email: 'test@example.com'
          };

          await signIn(data.token, user);

          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Main',
                params: {
                  improvementAreas,
                  screen: initialScreen
                }
              }
            ]
          });
        } catch (error) {
          console.error('Auto login error:', error);
          Alert.alert(
            'Hata',
            'Otomatik giriş başarısız oldu. Lütfen manuel olarak giriş yapın.'
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

    autoLogin();
  }, [route.params?.shouldAutoLogin]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre alanları boş bırakılamaz.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('==================== LOGIN REQUEST ====================');
      console.log('Login attempt for:', email);
      console.log('Request URL:', `${API_URL}/auth/login`);
      console.log('Request body:', {
        email,
        password: '********' // Şifreyi gizle
      });
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      
      console.log('==================== LOGIN RESPONSE ====================');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response data:', JSON.stringify(data, null, 2));

      // HTTP durum koduna göre hataları işle
      if (response.status !== 200) {
        console.log('==================== ERROR HANDLING ====================');
        let errorMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
        
        switch (response.status) {
          case 401:
            console.log('UNAUTHORIZED:', data);
            errorMessage = 'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.';
            break;
          case 400:
            console.log('BAD REQUEST:', data);
            errorMessage = data.errors?.[0]?.msg || 'Geçersiz e-posta formatı';
            break;
        }
        
        setIsLoading(false);
        Alert.alert('Hata', errorMessage);
        return;
      }

      // Başarılı yanıtı kontrol et
      if (!data.token || !data.userId) {
        console.log('==================== VALIDATION ERROR ====================');
        console.log('Invalid API response:', data);
        setIsLoading(false);
        Alert.alert(
          'Hata',
          'Sunucudan geçersiz yanıt alındı. Lütfen daha sonra tekrar deneyin.'
        );
        return;
      }

      // Başarılı giriş - user nesnesini oluştur
      const user = {
        id: data.userId,
        name: email.split('@')[0],
        email: email
      };

      console.log('==================== USER OBJECT ====================');
      console.log('Created user object:', user);

      try {
        // AuthContext ile giriş yap
        await signIn(data.token, user);
        console.log('==================== AUTH SUCCESS ====================');
        console.log('Sign in successful with token:', data.token.substring(0, 10) + '...');

        // Kullanıcının mevcut challenge'larını kontrol et
        const existingProgress = await StorageService.getProgress();
        console.log('==================== PROGRESS CHECK ====================');
        console.log('Existing progress:', existingProgress);
        
        const hasExistingChallenges = existingProgress && Object.keys(existingProgress).length > 0;

        // Navigation stack'i sıfırla ve yeni root ekranı ayarla
        navigation.reset({
          index: 0,
          routes: [
            {
              name: hasExistingChallenges ? 'Main' : 'Intro',
              params: hasExistingChallenges ? {
                screen: 'Challenges'
              } : undefined
            }
          ]
        });

      } catch (error) {
        console.log('==================== AUTH ERROR ====================');
        console.error('Auth error:', error);
        setIsLoading(false);
        Alert.alert(
          'Hata',
          'Giriş işlemi başarısız oldu. Lütfen tekrar deneyin.'
        );
        return;
      }

    } catch (error) {
      console.log('==================== NETWORK ERROR ====================');
      console.error('Network error:', error.message);
      console.error('Full error:', error);
      setIsLoading(false);
      Alert.alert(
        'Hata',
        'Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Hata', 'Şifre sıfırlama için e-posta adresinizi girin.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Şifre sıfırlama başarısız');
      }

      Alert.alert(
        'Başarılı',
        'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.'
      );

    } catch (error) {
      Alert.alert(
        'Hata',
        error.message || 'Şifre sıfırlama işlemi başarısız oldu. Lütfen tekrar deneyin.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/water-drop.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>{strings.welcome}</Text>
          <Text style={styles.subtitle}>{strings.slogan}</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder={strings.email}
            placeholderTextColor="#A5D8EF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder={strings.password}
            placeholderTextColor="#A5D8EF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Giriş yapılıyor...' : strings.login}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            <Text style={styles.forgotPasswordText}>{strings.forgotPassword}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64B5F6',
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    color: '#2196F3',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#2196F3',
    fontSize: 14,
  },
}); 