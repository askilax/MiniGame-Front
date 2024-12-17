import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import _FontAwesome from 'react-native-vector-icons/FontAwesome';
const FontAwesome = _FontAwesome as React.ElementType;
import Modal from 'react-native-modal';
import { useAuth } from '../context/AuthContext';
import { BASEURL } from '@env';


type RootStackParamList = {
  Login: undefined;
};

const { width } = Dimensions.get('window');
const GRID_SIZE = 20;
const CELL_SIZE = width / GRID_SIZE;



const SnakeGame: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [snake, setSnake] = useState<Array<{ x: number; y: number }>>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<{ x: number; y: number }>({ x: 1, y: 0 });
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [gameOverModalVisible, setGameOverModalVisible] = useState<boolean>(false);
  const { validateToken } = useAuth();

  const GAME_NAME = "snakeGame";

  const handleGoBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const initializeGame = async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setIsLoading(false);
    };

    initializeGame();
  }, []);

  const fetchHighScoreDataBase = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken')

      const response = await axios.get(`${BASEURL}/users/highScore/${GAME_NAME}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = response.data;

      if (data.result) {
        setHighScore(data.highScore)
      } else {
        if (!data) {
          console.error("erreur lors du chargement du highScore", data.message);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement du meilleur score", error);
    }
  }

  const updateHighScoreDataBase = async (newScore: number) => {
    try {
      const token = await AsyncStorage.getItem('userToken')

      const response = await axios.post(`${BASEURL}/users/highScore`,
        { game: GAME_NAME, score: newScore },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data

      if (data.result) {
        setHighScore(newScore)
        return { success: true, data };
      } else {
        console.error('Erreur lors de la mise à jour du highScore', data.message);
        return { success: false, message: data.message };
      }

    } catch (error) {
      console.error('Erreur lors de la mise a jour du highScore', error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchHighScoreDataBase();
      placeFood();

    };
    fetchData();
  }, []);


  useEffect(() => {
    if (isGameRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(moveSnake, 140);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isGameRunning, direction]);


  const placeFood = () => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    setFood({ x, y });
  };

  const moveSnake = () => {
    setSnake(prevSnake => {
      const newHead = {
        x: prevSnake[0].x + direction.x,
        y: prevSnake[0].y + direction.y,
      };

      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        handleGameOver();
        return prevSnake;
      }

      for (let segment of prevSnake) {
        if (segment.x === newHead.x && segment.y === newHead.y) {
          handleGameOver();
          return prevSnake;
        }
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prevScore => prevScore + 1);
        placeFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

  const handleGameOver = async () => {
    setIsGameRunning(false);

    setTimeout(async () => {
      if (score > highScore) {
        try {
          await updateHighScoreDataBase(score);

        } catch (error) {
          console.error('Erreur lors de la gestion du game over:', error);
        }
      }
      setGameOverModalVisible(true);
    }, 1000);
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    setScore(0);
    placeFood();
  };

  const changeDirection = (newDirection: { x: number; y: number }) => {
    setDirection(prevDirection => {
      if (
        (newDirection.x === 0 && prevDirection.y === newDirection.y) ||
        (newDirection.y === 0 && prevDirection.x === newDirection.x)
      ) {
        return prevDirection;
      }
      return newDirection;
    });
  };

  const handleStartGame = () => {
    setIsGameRunning(true);
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require('../assets/animations/snake-loading.json')}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
        <Text style={styles.loadingText}>Bienvenue sur Snake</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/background/backFull.png')} style={styles.background} />
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <FontAwesome name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
      <Modal
        isVisible={gameOverModalVisible}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropOpacity={0.8}
        backdropColor="#000"
      >
        <View style={styles.modalContainer}>
          <Image source={require('../assets/snake/gameOver.png')} style={styles.gameOverImage} />
          <Text style={styles.modalTitle}>
            {score > highScore ? 'Félicitations ! Nouveau record 🎉' : 'Partie terminée !'}
          </Text>
          <Text style={styles.modalScore}>Score : {score}</Text>
          <TouchableOpacity style={styles.restartButton} onPress={() => {
            setGameOverModalVisible(false);
            resetGame();
          }}>
            <Text style={styles.restartText}>Recommencer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
            <Text style={styles.goBackText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.highScore}>High Score: {highScore}</Text>
      </View>
      <View style={styles.gameBoard}>
        {snake.map((segment, index) => (
          <View
            key={index}
            style={[
              styles.snake,
              {
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
              },
            ]}
          />
        ))}
        <Image
          source={require('../assets/snake/food.png')}
          style={[
            styles.food,
            {
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
            },
          ]}
        />
      </View>
      <View style={styles.controlsContainer}>
        {!isGameRunning && (
          <TouchableOpacity onPress={handleStartGame} style={styles.startButton}>
            <Text style={styles.controlText}>Start Game</Text>
          </TouchableOpacity>
        )}
        <View style={styles.controlRow}>
          <TouchableOpacity onPress={() => changeDirection({ x: 0, y: -1 })} style={styles.controlButton}>
            <Text style={styles.controlText}>Up</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity onPress={() => changeDirection({ x: -1, y: 0 })} style={styles.controlButton}>
            <Text style={styles.controlText}>Left</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeDirection({ x: 1, y: 0 })} style={styles.controlButton}>
            <Text style={styles.controlText}>Right</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity onPress={() => changeDirection({ x: 0, y: 1 })} style={styles.controlButton}>
            <Text style={styles.controlText}>Down</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
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
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 10,
    padding: 20,
  },
  score: {
    paddingLeft: 30,
    fontSize: 18,
    fontWeight: 'bold',
  },
  highScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameBoard: {
    width: width,
    height: width,
    backgroundColor: '#e0e0e0',
  },
  snake: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: 'green',
    borderRadius: 7
  },
  food: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  controlsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  controlButton: {
    padding: 20,
    backgroundColor: '#4CAF50',
    margin: 5,
    width: 150,
    borderRadius: 10
  },
  startButton: {
    padding: 20,
    backgroundColor: '#FF5722',
    marginBottom: 20,
    borderRadius: 10
  },
  controlText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 10,
    padding: 10,
    borderRadius: 50,
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOverImage: {
    width: width * 0.8,
    height: width * 0.8,
    resizeMode: 'cover',
    borderRadius: 250,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalScore: {
    fontSize: 18,
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: width * 0.8,
    alignItems: 'center',
    marginBottom: 10,
  },
  restartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  goBackButton: {
    backgroundColor: '#FF5722',
    padding: 15,
    borderRadius: 10,
    width: width * 0.8,
    alignItems: 'center',
  },
  goBackText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

});

export default SnakeGame;
