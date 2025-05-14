import { Button, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { TOTAL_ATTEMPTS, WORD_LENGTH } from '@/constants/game.constants';
import { useAuth } from '@/context/auth/authContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedInput } from '@/components/ThemedInput';
import { Colors, UI_Colors } from '@/constants/Colors';
import { finishGame } from '@/helpers/http/finishGame';
import { Timer } from '@/components/ui/Timer';
import { createGame } from '@/helpers/http/createGame';
import { sendAttempt } from '@/helpers/http/sendAttempt';

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
  const { authToken, clearToken } = useAuth();
  const router = useRouter();
  const [guesses, setGuesses] = useState<GuessCell[][]>(initGuesses());
  const [currentRow, setCurrentRow] = useState(0);
  const [playAgain, setPlayAgain] = useState(0);
  const [shouldRestartTimer, setShouldRestartTimer] = useState(false);

  function initGuesses() {
    let guesses: GuessCell[][] = new Array(new Array(5).length);
    for (let i = 0; i <= TOTAL_ATTEMPTS - 1; i++) {
      guesses[i] = [];
      for (let j = 0; j <= WORD_LENGTH - 1; j++) {
        guesses[i][j] = { letter: '', status: null }
      }
    }
    return guesses;
  }

  function resetGame() {
    setGuesses(initGuesses());
    setGameProps({
      completeGameMsg: '',
      isInProgress: true
    });
    setCurrentRow(0);
    setShouldRestartTimer(true);
  }

  // Fetch the word of the game and reset the game when goes out
  useEffect(() => {
    (async () => {
      try {
        const response = await createGame(authToken);

        // In case the user has not a session
        if (response.statusCode === 401) {
          clearToken();
          setError('You must have a valid session');
          setTimeout(() => {
            router.replace('/(auth)/logIn');
          }, 3000);
        }

        // if the user complete the game (has played all words)
        if (response.status === 400) {
          setError(response.message);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      (async () => await finishGame(authToken))();
    }
  }, [playAgain]);

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

        try {
          const response = await sendAttempt(word, authToken);

          if (!response) {
            setError("An error has ocurred");
            return;
          }

          if (response.status === 404) {
            setError(response.message);
            return;
          }

          // In case the user has not a valid session
          if (response.statusCode === 401) {
            clearToken();
            setError('You must have a valid session');
            setTimeout(() => {
              router.replace('/(auth)/logIn');
            }, 3000);
            return;
          }

          // Receive a message when the game is over (wor or lose)
          if (response.message) {
            setGameProps({
              isInProgress: false,
              completeGameMsg: response.message
            });
            console.log('finalizando juego');
            await finishGame(authToken);
          }

          const feedback = response.data;

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
          setGuesses(newGuessesStatus);
          setCurrentRow(prev => ++prev);
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView className='md:container md:mx-auto p-6' style={{ flex: 1 }}>
        <ThemedText className='text-center text-2xl font-bold'>Guess the word</ThemedText>
        {
          error && (
            <ThemedText
              className='p-4 mx-auto my-4'
              style={{
                backgroundColor: UI_Colors.RED,
                color: UI_Colors.WHITE,
                borderRadius: 4
              }}>
              {error}
            </ThemedText>
          )
        }
        {/* View for timer */}
        {
          !error ?
            <Timer setShouldRestartTimer={setShouldRestartTimer} shouldRestart={shouldRestartTimer} isInProgress={gameProps.isInProgress} setGameProps={setGameProps} />
            :
            null
        }

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
                        editable={rowIndex === currentRow && gameProps.isInProgress}
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
              await finishGame(authToken);
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
              await finishGame(authToken);
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