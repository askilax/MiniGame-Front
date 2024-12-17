import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ListRenderItem, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';


type RootStackParamList = {
  Snake: undefined;
  Tetris: undefined;
  Memorie: undefined;
  Profile: undefined;
  Login: undefined;
};

interface Game {
  id: keyof RootStackParamList;
  title: string;
}

const GamesGridScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth()

  const games: Game[] = [
    { id: 'Snake', title: 'Snake' },
    { id: 'Memorie', title: 'Memorie' },
  ];


  const handleProfile = async () => {
    try {
      navigation.navigate('Profile')
    } catch (error) {
      Alert.alert('Erreur', "Impossible de ce rendre sur le profile.")
    }
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  const handlePress = (gameId: keyof RootStackParamList) => {
    navigation.navigate(gameId);
  };

  const renderGameItem: ListRenderItem<Game> = ({ item }) => (
    <TouchableOpacity style={styles.gameItem} onPress={() => handlePress(item.id)}>
      <Text style={styles.gameTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Image source={require('../assets/background/backFull.png')} style={styles.background} />
      <FlatList
        data={games}
        renderItem={renderGameItem}
        keyExtractor={(item) => item.id}
        numColumns={2} // Deux colonnes par ligne
      />
      <TouchableOpacity style={styles.profileButton} onPress={handleProfile}>
        <Text style={styles.profileText}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  gameItem: {
    flex: 1,
    margin: 10,
    marginTop: 60,
    padding: 20,
    backgroundColor: '#A0DEFF',
    alignItems: 'center',
    borderRadius: 10,
    opacity: 0.8
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ff4d4d',
    borderRadius: 10,
    alignItems: 'center',
  },
  profileButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#A0DEFF',
    opacity: 0.8,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  background: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    bottom: 0,
    width: '120%',
    height: '130%',
    resizeMode: 'cover',
    shadowOpacity: 0.9,
  },
});

export default GamesGridScreen;
