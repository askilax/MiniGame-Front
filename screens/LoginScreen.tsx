import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BASEURL } from '@env';
import { Video, ResizeMode } from 'expo-av';



interface LoginScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [loginEmailOrUsername, setLoginEmailOrUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [registerEmail, setRegisterEmail] = useState<string>('');
  const [registerUsername, setRegisterUsername] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');

  // Fonction de connection
  const handleLogin = async () => {
    if (!loginEmailOrUsername || !loginPassword) {
      alert('Veuillez entrer tous les champs requis');
      return;
    }
    try {
      const response = await axios.post<{ token: string }>(
        `${BASEURL}/users/login`,
        {
          emailOrUsername: loginEmailOrUsername,
          password: loginPassword,
        },
      );

      if (response.status) {
        await AsyncStorage.setItem('userToken', response.data.token);

        navigation.navigate('GamesGrid');
      } else {
        alert('Échec de la connexion');
      }
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      alert('Erreur lors de la connexion');
    }
  };

  // Fonction d'inscription
  const handleRegister = async () => {
    if (!registerEmail || !registerUsername || !registerPassword) {
      alert('Veuillez entrer tous les champs requis');
      return;
    }
    try {
      const response = await axios.post(
        `${BASEURL}/users/register`,
        {
          email: registerEmail,
          username: registerUsername,
          password: registerPassword,
        }
      )

      if (response.status) {
        await AsyncStorage.setItem('userToken', response.data.token)

        navigation.navigate('GamesGrid');
        setRegisterEmail('');
        setRegisterUsername('');
        setRegisterPassword('');
      } else {
        alert("Échec de l'inscription");
      }
    } catch (error: any) {
      if (error.response && error.response) {
        alert(error.response.data.message);
      } else {
        alert("Une erreur s'est produite. Veuillez réessayer.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Video
        source={require('../assets/videos/logo.mp4')}
        style={styles.background}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        isMuted
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={-15}>
        <Text style={styles.title}>Mini Game</Text>

        <TextInput
          style={styles.input}
          placeholder="Email ou Username"
          placeholderTextColor="white"
          value={loginEmailOrUsername}
          onChangeText={setLoginEmailOrUsername}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="white"
          value={loginPassword}
          onChangeText={setLoginPassword}
          secureTextEntry
        />
        <TouchableOpacity
          onPress={handleLogin}>
          <Text style={styles.buttonText}>Se Connecter</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="white"
          value={registerEmail}
          onChangeText={setRegisterEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="white"
          value={registerUsername}
          onChangeText={setRegisterUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="white"
          value={registerPassword}
          onChangeText={setRegisterPassword}
          secureTextEntry
        />
        <TouchableOpacity
          onPress={handleRegister}>
          <Text style={styles.buttonTextIns}>S'inscrire</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 130,
    textAlign: 'center',
    color: 'white',
    fontStyle: 'italic'
  },
  titleConnect: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  btn: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  titleInscription: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 20
  },
  input: {
    borderWidth: 1,
    borderColor: 'white',
    color: 'white',
    margin: 10,
    padding: 3,
    borderRadius: 20,
    width: 300,
    textAlign: 'center',
    fontSize: 25
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '120%',
  },
  buttonText: {
    fontSize: 25,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 100,
  },
  buttonTextIns: {
    color: 'white',
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default LoginScreen;