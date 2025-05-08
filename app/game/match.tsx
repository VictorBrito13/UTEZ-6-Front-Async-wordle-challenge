import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { baseURL } from '@/helpers/baseUrl';
import { GAME_DURATION, TOTAL_ATTEMPTS, WORD_LENGTH } from '@/constants/game.constants';
import { TextInput } from 'react-native-gesture-handler';
import { useAuth } from '@/context/auth/authContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Match() {
  const [ word, setWord ] = useState('');
  const [ error, setError ] = useState('');
  const [ timer, setTimer ] = useState(GAME_DURATION);
  const { authToken, clearToken } = useAuth();
  const router = useRouter();
  const [guesses, setGuesses] = useState<string[][]>(
    Array(TOTAL_ATTEMPTS).fill(Array(WORD_LENGTH).fill(''))
  );
  const inputRefs = useRef<TextInput[][]>([]);

  // Fetch the word of the game
  useEffect(() => {
    async function fetchWord() {
      try {
        const response = await fetch(`${baseURL}/game-core/create-game`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
        const data = await response.json();

        // In case the user has not a session
        if(data.statusCode === 401) {
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
        setWord(data.word);
        console.log(data);
      } catch (error) {
        console.error('Error fetching word:', error);
      }
    }

    // fetchWord();
  }, []);

  // Set timmer
  useEffect(() => {
    setInterval(() => {
      setTimer(prev => prev - 1000);
    }, 1000)
  }, []);

  function formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  async function sendAttempt(word: string) {
    const response = fetch(`${baseURL}/game-core/guess-word`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    const data = await ((await response).json());

    // In case the user has not a valid session
    if(data.statusCode === 401) {
      clearToken();
      setError('You must have a valid session');
      setTimeout(() => {
        router.replace('/(auth)/logIn');
      }, 3000);
    }

    console.log(data)
  }

  const handleInputChange = (text: string, row: number, col: number) => {
    if (text.length <= 1) {
      const newGuesses = guesses.map((guessRow, r) =>
        r === row ? guessRow.map((letter, c) => (c === col ? text.toUpperCase() : letter)) : guessRow
      );
      setGuesses(newGuesses);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedText>Guess the word</ThemedText>
      {/* View for timer */}
      <ThemedView>
        <ThemedText>Time left</ThemedText>
        <ThemedText>{formatTime(timer)}</ThemedText>
      </ThemedView>

      {/* View for the grid */}
      <ThemedView>
        {
          guesses.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((letter: string, colIndex: number) => (
                <ThemedView key={`col-${colIndex}`} style={styles.cell}>
                  <TextInput
                    style={styles.input}
                    value={letter}
                    onChangeText={(text) => handleInputChange(text, rowIndex, colIndex)}
                    maxLength={1}
                    autoCapitalize="characters"
                    textAlign="center"
                  />
                </ThemedView>
              ))}
            </View>
          ))
        }
      </ThemedView>
    </SafeAreaView>
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