import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Image, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import Modal from 'react-native-modal';
import _FontAwesome from 'react-native-vector-icons/FontAwesome'; Button
const FontAwesome = _FontAwesome as React.ElementType;
import { useAuth } from '../context/AuthContext';
import { BASEURL } from '@env';

type RootStackParamList = {
  Login: undefined;
};


const Profile = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [scores, setScores] = useState<Array<{ game: string; score: number }>>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const { validateToken, deleteAccount } = useAuth();

  const handleGoBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const checkAuth = async () => {
      const valid = await validateToken();
      if (!valid) {
        navigation.navigate('Login');
      }
    };
    checkAuth();
  }, []);


  useEffect(() => {
    const fetchScores = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');

        const response = await axios.get(`${BASEURL}/users/allScores`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;

        if (data.result) {
          setScores(data.scores);
        } else {
          Alert.alert('Erreur', 'Impossible de charger les scores.');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des scores:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors du chargement des scores.');
      }
    };

    fetchScores();
  }, []);

  const handleDelete = async () => {
    const success = await deleteAccount();
    if (success) {
      navigation.navigate('Login');
    }
  };




  const gameNameMapping: { [key: string]: string } = {
    memoryGame: "Mémorie",
    snakeGame: "Snake",
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/background/backFull.png')} style={styles.background} />
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <FontAwesome name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
      <View style={styles.profileContainer}>
        <Text style={styles.title}>Mon Profil</Text>
        <Text style={styles.subtitle}>Meilleurs Scores :</Text>
        <View style={styles.scoresContainer}>
          {scores.map((score, index) => (
            <View key={index} style={styles.scoreItem}>
              <Text style={styles.gameName}> {gameNameMapping[score.game] || score.game}</Text>
              <Text style={styles.gameScore}>{score.score}</Text>
            </View>
          ))}
        </View>
        {showDeleteModal && (
          <Modal
            isVisible={true}
            backdropOpacity={0.8}
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Supprimer le compte</Text>
              <Text style={styles.modalMessage}>
                Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#FF5722', marginRight: 10 }]}
                  onPress={async () => {
                    setShowDeleteModal(false);
                    await handleDelete();
                  }}
                >
                  <Text style={styles.modalButtonText}>Supprimer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.modalButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setShowDeleteModal(true)}
        >
          <Text style={styles.deleteButtonText}>Supprimer le compte</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowOpacity: 0.2,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 10,
    padding: 10,
    borderRadius: 50,
    zIndex: 1000,
  },
  profileContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    width: '70%',
    height: '70%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  highScoreText: {
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 20,
  },
  deleteButton: {
    padding: 15,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  scoresContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  gameName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  gameScore: {
    fontSize: 16,
    color: '#4CAF50',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Profile;