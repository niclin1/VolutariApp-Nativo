import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useApp } from './src/context/AppContext';
import { RootStackParamList } from './src/types';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import VagaDetailScreen from './src/screens/VagaDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OngHomeScreen from './src/screens/OngHomeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { isLoadingAuth, token, currentUserRole } = useApp();

  if (isLoadingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2d7a2d" />
      </View>
    );
  }

  const isAuthenticated = !!token;
  const isOng = currentUserRole === 'ong' || currentUserRole === 'admin';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={
          isAuthenticated ? (isOng ? 'OngHome' : 'Home') : 'Welcome'
        }
        screenOptions={{ headerShown: false }}
      >
        {/* Auth screens */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Volunteer screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="VagaDetail" component={VagaDetailScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />

        {/* ONG screens */}
        <Stack.Screen name="OngHome" component={OngHomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </AppProvider>
  );
}
