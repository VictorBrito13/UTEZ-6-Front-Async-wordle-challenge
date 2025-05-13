import { Button, StyleSheet, Text, useColorScheme, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { baseURL } from '@/helpers/baseUrl';
import { GAME_DURATION, TOTAL_ATTEMPTS, WORD_LENGTH } from '@/constants/game.constants';
import { useAuth } from '@/context/auth/authContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedInput } from '@/components/ThemedInput';
import { Colors, UI_Colors } from '@/constants/Colors';

interface GuessCell {
  status: 'correct' | 'present' | 'absent' | null;
  letter: string;
}

export default function Match() {
  const [error, setError] = useState('');
  const [gameProps, setGameProps] = useState({
    completeGameMsg: '',
    isInProgress: true
  });
  const [timer, setTimer] = useState(GAME_DURATION);
  const { authToken, clearToken } = useAuth();
  const router = useRouter();
  const [guesses, setGuesses] = useState<GuessCell[][]>(initGuesses());
  const [currentRow, setCurrentRow] = useState(0);
  const [playAgain, setPlayAgain] = useState(0);
  const timerIdRef = useRef<number | undefined>(undefined);

  function initGuesses() {
    let guesses: GuessCell[][] = new Array(new Array(5).length);
    for(let i = 0; i <= TOTAL_ATTEMPTS - 1; i++) {
      guesses[i] = [];
      for(let j = 0; j <= WORD_LENGTH - 1; j++) {
        guesses[i][j] = { letter: '', status: null }
      }
    }
    return guesses;
  }

  function resetGame() {
    setTimer(GAME_DURATION);
    setGuesses(initGuesses());
    setGameProps({
      completeGameMsg: '',
      isInProgress: true
    });
    setCurrentRow(0);
    timerIdRef.current = undefined;
  }

  async function createGame() {
    try {
      const response = await fetch(`${baseURL}/game-core/create-game`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const data = await response.json();

      // In case the user has not a session
      if (data.statusCode === 401) {
        clearToken();
        setError('You must have a valid session');
        setTimeout(() => {
          router.replace('/(auth)/logIn');
        }, 3000);
      }

      // if the user complete the game (has played all words)
      if (data.status === 400) {
        setError(data.message);
        return;
      }
      console.log(data);
    } catch (error) {
      console.error('Error fetching word:', error);
    }
  }

  // Fetch the word of the game and reset the game when goes out
  useEffect(() => {
    (async () => await createGame())();

    return () => {
      (async () => await finishGame())();
    }
  }, [playAgain]);

  async function finishGame() {
    const response = await fetch(`${baseURL}/game-core/finish-game`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    console.log(data);
    console.log('juego finalizado');
    return data;
  }

  // Set timmer
  useEffect(() => {
    console.log('Ejecutando efect del timmer');
    console.log(gameProps);
    if (gameProps.isInProgress) {
      timerIdRef.current = setInterval(() => {
        setTimer(prev => {
          let time = prev - 1000;
          // Stop the game when the time is 0
          if (time <= 0) {
            // finish the game
            (async () => {
              const response = await finishGame();
              setGameProps({
                completeGameMsg: response.message,
                isInProgress: false
              });
            })();

            if (timerIdRef.current) {
              console.log('Limpiando el timer con ID:', timerIdRef.current);
              clearInterval(timerIdRef.current);
              timerIdRef.current = undefined; // Reset the ref
            } else {
              console.log('No hay timer para limpiar.');
            }

            return 0;
          }
          return time;
        });
      }, 1000);
    }

    return () => {
      if (timerIdRef.current) {
        console.log('Limpiando el timer con ID:', timerIdRef.current);
        clearInterval(timerIdRef.current);
        timerIdRef.current = undefined; // Reset the ref
      } else {
        console.log('No hay timer para limpiar.');
      }
    }
  }, [gameProps.isInProgress]);

  function formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  async function sendAttempt(word: string) {
    const response = await fetch(`${baseURL}/game-core/guess-word`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ word })
    });

    const data = await response.json();

    if (data.status === 404) {
      setError(data.message);
      return;
    }

    // In case the user has not a valid session
    if (data.statusCode === 401) {
      clearToken();
      setError('You must have a valid session');
      setTimeout(() => {
        router.replace('/(auth)/logIn');
      }, 3000);
      return;
    }

    // Receive a message when the game is over (wor or lose)
    if (data.message) {
      setGameProps({
        isInProgress: false,
        completeGameMsg: data.message
      });
      console.log('finalizando juego');
      await finishGame();
    }

    return data.data;
  }

  // This function is to change the values of the current row ans a specific column
  const handleInputChange = async (text: string, row: number, col: number) => {
    if (text.length <= 1) {
      const newGuesses = [...guesses];
      let cell = newGuesses[row][col];
      newGuesses[row][col] = { ...cell, letter: text.toUpperCase() };
      setGuesses(newGuesses);

      // If all the letters in this row are defined: send an attempt to guess the word
      if (!newGuesses[row].some(letter => letter.letter.trim() === '')) {
        const word: string = newGuesses[row].map(col => col.letter).join('');
        const feedback = await sendAttempt(word);

        // Update the letter status
        const newGuessesStatus = newGuesses.map((guessRow, r) =>
          r === row
            // Access the current row
            ? guessRow.map((cell, c) => {
              // Access the columns to modify the status of the object GuessCell
              return { ...cell, status: feedback[c.toString()].status }
            })
            : guessRow
        );
        console.log("Feedback", feedback);
        console.log("new guesses status", newGuessesStatus);
        setGuesses(newGuessesStatus);
        setCurrentRow(prev => ++prev);
      }
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView className='md:container md:mx-auto p-6' style={{ flex: 1 }}>
        <ThemedText className='text-center text-2xl font-bold'>Guess the word</ThemedText>
        {
          error && (
            <ThemedText>{error}</ThemedText>
          )
        }
        {/* View for timer */}
        <ThemedView className='w-1/4' style={{ backgroundColor: UI_Colors.RED, borderRadius: 4 }}>
          <ThemedText className='text-center p-4' style={{ color: UI_Colors.WHITE }}>Time left {formatTime(timer)}</ThemedText>
        </ThemedView>

        {/* View for the grid */}
        <ThemedView className='mx-auto'>
          {
            guesses.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.row}>
                {row.map((letter: GuessCell, colIndex: number) => {
                  // Define the background of the input depending on the letter correctness
                  let backgroundColor = UI_Colors.WHITE;
                  if (letter.status === 'correct') {
                    backgroundColor = UI_Colors.LIGHT_GREEN;
                  } else if (letter.status === 'present') {
                    backgroundColor = UI_Colors.ORANGE;
                  } else if (letter.status === 'absent') {
                    backgroundColor = UI_Colors.RED;
                  }
                  return (
                    <ThemedView key={`col-${colIndex}`} style={styles.cell}>
                      <ThemedInput
                        darkColor={Colors.dark.text}
                        style={{
                          ...styles.input,
                          backgroundColor: UI_Colors.WHITE,
                          color: UI_Colors.GRAY,
                          borderWidth: 4,
                          borderColor: backgroundColor
                        }}
                        value={letter.letter}
                        onChangeText={(text) => handleInputChange(text, rowIndex, colIndex)}
                        maxLength={1}
                        autoCapitalize="characters"
                        editable={rowIndex === currentRow}
                        textAlign="center"
                      />
                    </ThemedView>
                  )
                })}
              </View>
            ))
          }
        </ThemedView>

        {/* Button to play again */}
        <ThemedView className='my-6'>
          <Button
            title='Play Again'
            onPress={async () => {
              await finishGame();
              resetGame();
              setPlayAgain(prev => ++prev);
            }}
          />
        </ThemedView>

        {/* Leave game button */}
        <ThemedView>
          <Button
            color={UI_Colors.RED}
            title='Leave Game'
            onPress={async () => {
              // Finish the game
              await finishGame();
              router.replace('/game/stats');
            }}
          />
        </ThemedView>

        {/* Indicators */}
        <ThemedView>
          <ThemedText className='mb-4 mt-4'>If the box edge is 🟢 it means the letter is present in the word and is placed correctly.</ThemedText>
          <ThemedText className='mb-4'>If the box edge is 🟠 it means the letter is present in the word but is not placed correctly.</ThemedText>
          <ThemedText className='mb-4'>If the box edge is 🔴 it means the letter is not present in the word.</ThemedText>
        </ThemedView>
        {
          gameProps.completeGameMsg &&
          <ThemedText
            className='w-1/4 p-4 mx-auto my-4 text-center'
            lightColor={UI_Colors.WHITE}
            style={{
              backgroundColor: `${gameProps.completeGameMsg.toLowerCase().includes('over') ? UI_Colors.RED : UI_Colors.LIGHT_GREEN}`,
              borderColor: `${gameProps.completeGameMsg.toLowerCase().includes('won') ? UI_Colors.YELLOW : ''}`,
              borderWidth: parseInt(`${gameProps.completeGameMsg.toLowerCase().includes('won') ? 2 : 0}`),
              borderRadius: 4
            }}
          >{gameProps.completeGameMsg}</ThemedText>
        }
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  gridContainer: {
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 50,
    height: 50,
    margin: 5,
    borderWidth: 1,
    borderColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    fontSize: 20,
    fontWeight: 'bold',
    width: '100%',
    height: '100%',
    textAlign: 'center',
  },
});