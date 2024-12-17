import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GamesGridScreen from './screens/GamesGridScreen';
import SnakeGame from './screens/SnakeGame';
import Memorie from './screens/Memorie';
import LoginScreen from './screens/LoginScreen';
import Profile from './screens/Profile';
import { ActivityIndicator, View } from 'react-native';


const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName={isAuthenticated ? 'GamesGrid' : 'Login'} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="GamesGrid" component={GamesGridScreen} />
          <Stack.Screen name="Snake" component={SnakeGame} />
          <Stack.Screen name="Memorie" component={Memorie} />
        </Stack.Navigator>
      </NavigationContainer>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
