import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASEURL } from '@env';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  
  const validateToken = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setIsAuthenticated(false);
        setSessionExpired(true);
        return false;
      }

      const response = await axios.get(`${BASEURL}/users/validate-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.valid) {
        setIsAuthenticated(true);
        return true;
      } else {
        setIsAuthenticated(false);
        setSessionExpired(true);
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      setIsAuthenticated(false);
      setSessionExpired(true);
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setIsAuthenticated(false);
  };

  const deleteAccount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.delete(`${BASEURL}/users/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
      }
      )
      await logout();
      Alert.alert('Compte supprimé', 'Votre compte a été supprimé avec succès.');
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression de votre compte.');
      return false;
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      await validateToken();
      setLoading(false);
    };
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, logout, validateToken, deleteAccount }}>
      {children}
      <Modal
        isVisible={sessionExpired}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.8}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Session expirée</Text>
          <Text style={styles.modalMessage}>
            Votre session a expiré. Veuillez vous reconnecter.
          </Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setSessionExpired(false);
              logout();
            }}
          >
            <Text style={styles.modalButtonText}>Se reconnecter</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

const styles = StyleSheet.create({
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
