import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import _FontAwesome from 'react-native-vector-icons/FontAwesome';
const FontAwesome = _FontAwesome as React.ElementType;
import { useAuth } from '../context/AuthContext';
import { BASEURL } from '@env';
import axios from "axios";

type RootStackParamList = {
    Login: undefined;
};

interface Card {
    id: number;
    image: any;
    isFlipped: boolean;
    isMatched: boolean;
}

const generateCards = (): Card[] => {
    const images = [
        require('../assets/memorie/image1.png'),
        require('../assets/memorie/image2.png'),
        require('../assets/memorie/image3.png'),
        require('../assets/memorie/image4.png'),
        require('../assets/memorie/image5.png'),
        require('../assets/memorie/image6.png'),
        require('../assets/memorie/image7.png'),
        require('../assets/memorie/image8.png'),
    ];
    return [...images, ...images].sort(() => Math.random() - 0.5).map((image, index) => ({
        id: index,
        image,
        isFlipped: false,
        isMatched: false,
    }));
};

export default function MemoryGame() {
    // les hooks utiliser
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [cards, setCards] = useState<Card[]>(generateCards());
    const [selectedCards, setSelectedCards] = useState<number[]>([]);
    const [score, setScore] = useState<number>(0);
    const [scoreSaved, setScoreSaved] = useState(false);
    const [highScore, setHighScore] = useState<number>(0);
    const [time, setTime] = useState<number>(60);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const { validateToken } = useAuth();

    const GAME_NAME = "memoryGame";

    // navigation pour retour sur la page des jeux
    const handleGoBack = () => {
        navigation.goBack();
    };

    useEffect(() => {
        const initializeGame = async () => {
            await new Promise((resolve) => setTimeout(resolve, 4000)); // Faux délai de 3 secondes
            setIsLoading(false);
        };

        initializeGame();
    }, []);

    //  check la validite du token 
    useEffect(() => {
        const checkAuth = async () => {
            const valid = validateToken();
            if (!valid) {
                navigation.navigate('Login')
            }
        }
        checkAuth()
    }, [])


    useEffect(() => {
        const loadHighScore = async () => {
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
        };
        loadHighScore();
    }, []);


    const handleCardPress = (cardIndex: number): void => {
        if (gameOver) return;
        const newCards = [...cards];
        if (newCards[cardIndex].isFlipped || newCards[cardIndex].isMatched) {
            return;
        }
        newCards[cardIndex].isFlipped = true;
        setCards(newCards);
        setSelectedCards((prevSelected) => [...prevSelected, cardIndex]);
    };


    useEffect(() => {
        if (selectedCards.length === 2) {
            const [firstIndex, secondIndex] = selectedCards;
            if (cards[firstIndex].image === cards[secondIndex].image) {
                const newCards = [...cards];
                newCards[firstIndex].isMatched = true;
                newCards[secondIndex].isMatched = true;
                setCards(newCards);
                setScore((prevScore) => prevScore + 10);
            } else {
                setTimeout(() => {
                    const newCards = [...cards];
                    newCards[firstIndex].isFlipped = false;
                    newCards[secondIndex].isFlipped = false;
                    setCards(newCards);
                    setScore((prevScore) => prevScore - 3);
                }, 1000);
            }
            setSelectedCards([]);
        }
    }, [selectedCards, cards]);

    const handleHighScoreUpdate = () => {
        if (!scoreSaved && score > highScore) {
            setHighScore(score);
            saveHighScore(score);
            setScoreSaved(true); // Marque le score comme sauvegardé
        }
    };
    
    useEffect(() => {
        const timer = setInterval(() => {
            setTime((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    setGameOver(true);
                    handleHighScoreUpdate(); // Appel de la fonction centralisée
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    
        if (cards.every(card => card.isMatched)) {
            clearInterval(timer);
            setGameOver(true);
            handleHighScoreUpdate(); // Appel de la fonction centralisée
        }
    
        return () => clearInterval(timer);
    }, [cards, score, highScore, scoreSaved]);
    
    const saveHighScore = async (newHighScore: number) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
    
            const response = await axios.post(`${BASEURL}/users/highScore`,
                { game: GAME_NAME, score: newHighScore },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            const data = response.data;
    
            if (!data.result) {
                console.error('Erreur lors de la mise à jour du highScore', data.message);
                return { success: false, message: data.message };
            }
            return { success: true, data };
        } catch (error) {
            console.error('Erreur lors de la mise à jour du highScore', error);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <LottieView
                    source={require('../assets/animations/cards-loading.json')}
                    autoPlay
                    loop
                    style={styles.loadingAnimation}
                />
                <Text style={styles.loadingText}>Bienvenue sur Memorie</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image source={require('../assets/background/backFull.png')} style={styles.background} />
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                <FontAwesome name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Jeu de Mémoire</Text>
            <Text style={styles.timer}>Temps restant: {time}s</Text>
            <Text style={styles.score}>Score: {score}</Text>
            <Text style={styles.highScore}>Meilleur score: {highScore}</Text>

            {gameOver ? (
                <View style={styles.gameOver}>
                    {cards.every(card => card.isMatched) ? (
                        <Text style={styles.gameOverText}>Bravo ! Toutes les cartes sont trouvées !</Text>
                    ) : (
                        <Text style={styles.gameOverText}>Temps écoulé !</Text>
                    )}
                    <Text style={styles.finalScore}>Score final : {score}</Text>
                    <TouchableOpacity style={styles.restartButton} onPress={() => {
                        setGameOver(false);
                        setScore(0);
                        setTime(60);
                        setCards(generateCards());
                    }}>
                        <Text style={styles.restartText}>Recommencer</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.grid}>
                    {cards.map((card, index) => (
                        <TouchableOpacity
                            key={card.id}
                            style={[styles.card, card.isFlipped || card.isMatched ? styles.flippedCard : styles.unflippedCard]}
                            onPress={() => handleCardPress(index)}
                            disabled={card.isFlipped || card.isMatched}
                        >
                            {card.isFlipped || card.isMatched ? (
                                <Image source={card.image} style={styles.cardImage} />
                            ) : (
                                <Text style={styles.cardText}>?</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

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
        backgroundColor: '#f0f0f0',
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    timer: {
        fontSize: 18,
        marginBottom: 10,
    },
    score: {
        fontSize: 18,
        marginBottom: 10,
    },
    highScore: {
        fontSize: 18,
        marginBottom: 20,
    },
    grid: {
        width: '90%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    card: {
        width: 70,
        height: 100,
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    unflippedCard: {
        backgroundColor: '#888',
    },
    flippedCard: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    cardText: {
        fontSize: 32,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 10,
        padding: 10,
        borderRadius: 50,
        zIndex: 1000,
    },
    gameOver: {
        marginTop: 20,
        alignItems: 'center',
    },
    gameOverText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'red',
        marginBottom: 10,
    },
    finalScore: {
        fontSize: 18,
        marginBottom: 20,
    },
    restartButton: {
        padding: 10,
        backgroundColor: '#4caf50',
        borderRadius: 8,
    },
    restartText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
    },
});