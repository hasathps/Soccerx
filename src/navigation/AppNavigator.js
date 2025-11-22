import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { restoreUser, logout } from '../store/slices/authSlice';
import { loadFavorites } from '../store/slices/favoritesSlice';
import { setTheme, toggleTheme } from '../store/slices/themeSlice';
import { Alert, TouchableOpacity, Text, View } from 'react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FootballScreen from '../screens/FootballScreen';
import DetailsScreen from '../screens/DetailsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import PlayersScreen from '../screens/PlayersScreen';
import PlayerDetailsScreen from '../screens/PlayerDetailsScreen';
import ChatAIScreen from '../screens/ChatAIScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function StackHeaderLeft({ navigation }) {
  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity
      onPress={handleBack}
      style={{
        marginLeft: 5,
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Ionicons name="arrow-back" size={24} color="#fff" />
    </TouchableOpacity>
  );
}

function StackThemeToggle() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return (
    <TouchableOpacity
      onPress={handleToggleTheme}
      style={{
        padding: 8,
        borderRadius: 8,
      }}
    >
      <Ionicons 
        name={isDarkMode ? "sunny" : "moon"} 
        size={19} 
        color="#fff" 
      />
    </TouchableOpacity>
  );
}

function StackHeaderRight() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      style={{
        marginRight: -2,
        padding: 8,
        borderRadius: 8,
      }}
    >
      <Ionicons name="log-out-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );
}

function MainTabs() {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const HeaderLeft = () => (
    <TouchableOpacity
      onPress={handleToggleTheme}
      style={{
        marginLeft: 11,
        padding: 8,
        borderRadius: 8,
      }}
    >
      <Ionicons 
        name={isDarkMode ? "sunny" : "moon"} 
        size={19} 
        color="#fff" 
      />
    </TouchableOpacity>
  );

  const HeaderRight = () => (
    <TouchableOpacity
      onPress={handleLogout}
      style={{
        marginRight: 5,
        padding: 8,
        borderRadius: 8,
      }}
    >
      <Ionicons name="log-out-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: isDarkMode ? '#87CEEB' : '#1F509A',
        tabBarInactiveTintColor: isDarkMode ? '#666' : '#999',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
          borderTopColor: isDarkMode ? '#333' : '#e0e0e0',
        },
        headerStyle: {
          backgroundColor: isDarkMode ? '#1a1a1a' : '#1F509A',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Football"
        component={FootballScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "football" : "football-outline"} 
              size={size || 24} 
              color={focused ? (isDarkMode ? '#87CEEB' : '#1F509A') : color} 
            />
          ),
          tabBarLabel: 'Matches',
          headerTitle: 'Matches',
          headerLeft: HeaderLeft,
          headerRight: HeaderRight,
        }}
      />
      <Tab.Screen
        name="Players"
        component={PlayersScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "people" : "people-outline"} 
              size={size || 24} 
              color={focused ? (isDarkMode ? '#87CEEB' : '#1F509A') : color} 
            />
          ),
          tabBarLabel: 'Players',
          headerLeft: HeaderLeft,
          headerRight: HeaderRight,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "heart" : "heart-outline"} 
              size={size || 24} 
              color={focused ? '#8B0000' : (isDarkMode ? '#666' : '#999')}
            />
          ),
          tabBarLabel: 'Favorites',
          headerLeft: HeaderLeft,
          headerRight: HeaderRight,
        }}
      />
      <Tab.Screen
        name="AI Assistant"
        component={ChatAIScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "chatbubbles" : "chatbubbles-outline"} 
              size={size || 24} 
              color={focused ? (isDarkMode ? '#87CEEB' : '#1F509A') : color} 
            />
          ),
          tabBarLabel: 'AI Assistant',
          headerLeft: HeaderLeft,
          headerRight: HeaderRight,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');
        const favoritesStr = await AsyncStorage.getItem('favorites');
        const isDarkModeStr = await AsyncStorage.getItem('isDarkMode');

        if (userStr && token) {
          try {
            const user = JSON.parse(userStr);
            dispatch(restoreUser({ user, token }));
          } catch (parseError) {
            // Error handling
          }
        }

        if (favoritesStr) {
          try {
            const favorites = JSON.parse(favoritesStr);
            dispatch(loadFavorites(favorites));
          } catch (parseError) {
            // Error handling
          }
        }

        if (isDarkModeStr) {
          try {
            const isDarkMode = JSON.parse(isDarkModeStr);
            dispatch(setTheme(isDarkMode));
          } catch (parseError) {
            // Error handling
          }
        }
      } catch (error) {
        // Error handling
      }
    };

    restoreSession();
  }, [dispatch]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="Details"
              component={DetailsScreen}
              options={({ navigation }) => ({
                headerShown: true,
                headerStyle: {
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#1F509A',
                },
                headerTintColor: '#fff',
                headerBackVisible: false,
                headerLeft: () => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: -25 }}>
                    <StackHeaderLeft navigation={navigation} />
                    <StackThemeToggle />
                  </View>
                ),
                headerRight: () => <StackHeaderRight />,
              })}
            />
            <Stack.Screen
              name="PlayerDetails"
              component={PlayerDetailsScreen}
              options={({ navigation }) => ({
                headerShown: true,
                headerStyle: {
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#1F509A',
                },
                headerTintColor: '#fff',
                headerTitle: 'Player Details',
                headerBackVisible: false,
                headerLeft: () => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: -25 }}>
                    <StackHeaderLeft navigation={navigation} />
                    <StackThemeToggle />
                  </View>
                ),
                headerRight: () => <StackHeaderRight />,
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

