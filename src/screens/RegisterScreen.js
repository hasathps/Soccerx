import React, { useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Formik } from 'formik';
import { Feather } from 'react-native-feather';
import { login } from '../store/slices/authSlice';
import { authAPI } from '../services/api';
import { registerSchema } from '../utils/validation';
import { useSelector } from 'react-redux';

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const handleRegister = async (values) => {
    setLoading(true);
    
    try {
      const response = await authAPI.register({
        username: values.username,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });

      if (response.id) {
        const sessionToken = `registered_token_${response.id}_${Date.now()}`;
        
        dispatch(
          login({
            user: {
              id: response.id,
              username: response.username,
              email: response.email,
              firstName: response.firstName || values.firstName,
              lastName: response.lastName || values.lastName,
            },
            token: sessionToken,
          })
        );
        
        const userName = response.firstName || values.firstName || response.username || 'User';
        Alert.alert(
          'Registered Successfully! 🎉',
          `Welcome to SoccerX, ${userName}!`,
          [
            {
              text: 'OK',
              style: 'default',
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Please try again';
      Alert.alert(
        'Registration Failed',
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.title}>Create Account</Text>
          </View>

          <Formik
            initialValues={{
              username: '',
              email: '',
              password: '',
              confirmPassword: '',
              firstName: '',
              lastName: '',
            }}
            validationSchema={registerSchema}
            onSubmit={handleRegister}
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
                    placeholder="Email"
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                    value={values.firstName}
                    onChangeText={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                  />
                </View>
                {touched.firstName && errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                    value={values.lastName}
                    onChangeText={handleChange('lastName')}
                    onBlur={handleBlur('lastName')}
                  />
                </View>
                {touched.lastName && errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
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

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    secureTextEntry
                  />
                </View>
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Register</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
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
