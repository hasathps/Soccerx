import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Formik } from 'formik';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../store/slices/authSlice';
import { authAPI } from '../services/api';
import { loginSchema } from '../utils/validation';
import { useSelector } from 'react-redux';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();

    return () => spinAnimation.stop();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleLogin = async (values) => {
    setLoading(true);
    
    try {
      const response = await authAPI.login(values.username, values.password);
      
      if (response.token) {
        dispatch(
          login({
            user: {
              id: response.id,
              username: response.username,
              email: response.email,
              firstName: response.firstName,
              lastName: response.lastName,
            },
            token: response.token,
          })
        );
        
        Alert.alert(
          'Login Successful! 🎉',
          `Welcome back, ${response.firstName || response.username || 'User'}!`,
          [
            {
              text: 'OK',
              style: 'default',
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Error', 'Invalid credentials');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Please check your credentials';
      Alert.alert(
        'Login Failed',
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(isDarkMode);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Animated.View
            style={{
              transform: [{ rotate: spin }],
            }}
          >
            <Ionicons name="football" size={64} color={isDarkMode ? '#87CEEB' : '#1F509A'} />
          </Animated.View>
          <Text style={styles.title}>SoccerX</Text>
        </View>

        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor={isDarkMode ? '#666' : '#999'}
                  value={values.username}
                  onChangeText={handleChange('username')}
                  onBlur={handleBlur('username')}
                  autoCapitalize="none"
                />
              </View>
              {touched.username && errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={isDarkMode ? '#666' : '#999'}
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry
                />
              </View>
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkBold}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#333',
      marginTop: 16,
    },
    form: {
      width: '100%',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
      borderRadius: 10,
      marginBottom: 12,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    input: {
      flex: 1,
      height: 50,
      color: isDarkMode ? '#fff' : '#333',
    },
    errorText: {
      color: '#f44336',
      fontSize: 12,
      marginBottom: 8,
      marginLeft: 5,
    },
    button: {
      backgroundColor: isDarkMode ? '#87CEEB' : '#1F509A',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    linkButton: {
      marginTop: 20,
      alignItems: 'center',
    },
    linkText: {
      color: isDarkMode ? '#999' : '#666',
      fontSize: 14,
    },
    linkBold: {
      color: isDarkMode ? '#87CEEB' : '#1F509A',
      fontWeight: 'bold',
    },
  });
