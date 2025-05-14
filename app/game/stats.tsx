import { StyleSheet, Text, View, FlatList, ActivityIndicator, Button, useColorScheme } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { useAuth } from '@/context/auth/authContext'
import { baseURL } from '@/helpers/baseUrl'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { UI_Colors } from '@/constants/Colors'
import { renderStatItem } from '@/components/ui/renderStatItem'

export interface WordStat {
  word: string;
  totalGuesses: number;
}

export interface PlayerStat {
  user: string;
  totalWins: number;
}

interface MyStats {
  totalGames: number;
  totalVictories: number;
}

export default function Stats() {
  const { authToken, clearToken } = useAuth();
  const [mostGuessedWords, setMostGuessedWords] = useState<WordStat[]>([]);
  const [topPlayers, setTopPlayers] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myStats, setMyStats] = useState<MyStats>();
  const router = useRouter();
  const themeRef = useRef(useColorScheme());

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {

        //* Fetch my stats
        const myStatsResponse = await fetch(`${baseURL}/game-stats/my-stats`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          },
        });
        const myStatsResponseJson = await myStatsResponse.json();
        if (myStatsResponseJson.statusCode >= 400 && myStatsResponseJson.statusCode < 500) {
          setError('Unauthorized access. Please log in again.');
          clearToken();
          setTimeout(() => {
            // Redirect to login page
            router.replace('/(auth)/logIn');
          }, 3000)
          return;
        }
        setMyStats(myStatsResponseJson.data);

        //* Fetch most guessed words
        const wordsResponse = await fetch(`${baseURL}/game-stats/top-words`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          },
        });
        const wordsResponseJson = await wordsResponse.json();
        if (wordsResponseJson.statusCode >= 400 && wordsResponseJson.statusCode < 500) {
          setError('Unauthorized access. Please log in again.');
          clearToken();
          setTimeout(() => {
            // Redirect to login page
            router.replace('/(auth)/logIn');
          }, 3000)
          return;
        }

        const wordsData: WordStat[] = wordsResponseJson.data;
        setMostGuessedWords(wordsData);

        //* Fetch top players
        const playersResponse = await fetch(`${baseURL}/game-stats/top-players`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          },
        });
        const playersResponseJson = await playersResponse.json();
        if (playersResponseJson.status >= 400 && playersResponseJson.status < 500) {
          setError('Unauthorized access. Please log in again.');
          clearToken();
          setTimeout(() => {
            // Redirect to login page
            router.replace('/(auth)/logIn');
          }, 3000)
          return;
        }
        const playersData: PlayerStat[] = playersResponseJson.data;
        setTopPlayers(playersData);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [authToken]);

  if (loading) {
    return <ThemedView style={styles.loadingContainer}><ActivityIndicator size="large" /></ThemedView>;
  }

  if (error) {
    return <ThemedView style={styles.errorContainer}><ThemedText>Error: {error}</ThemedText></ThemedView>;
  }

  return (
    <ThemedView className='px-2' style={{ flex: 1 }}>
      <SafeAreaView className='md:container md:mx-auto p-6' style={{ flex: 1 }}>
        <ThemedView style={{ flex: 1 }}>
          {/* Action buttons container */}
          <ThemedView className='flex flex-row'>
            <ThemedView className='w-1/2 p-4'>
              <Button
                color={UI_Colors.RED}
                title='Log out'
                onPress={ async () => {
                  await clearToken();
                  router.replace('/(auth)/logIn');
                }}
              />
            </ThemedView>
            <ThemedView className='w-1/2 p-4'>
              <Button
                color={themeRef.current === 'dark' ? UI_Colors.DARK_GREEN : UI_Colors.LIGHT_GREEN}
                title='Play'
                onPress={() => router.replace('/game/match')}
              />
            </ThemedView>
          </ThemedView>

          {/* Page Title */}
          <ThemedText style={styles.title}>Statistics</ThemedText>
          {/* User statistics */}
          <ThemedView className='mb-10'>
            <ThemedText className='font-bold' style={styles.sectionTitle}>My stats</ThemedText>
            <ThemedView className='border-2 flex flex-row justify-around' style={{ borderRadius: 4 }}>
              <ThemedText className='text-center p-4'>My Games: {myStats?.totalGames}</ThemedText>
              <ThemedText className='text-center p-4'>My Victories: {myStats?.totalVictories}</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Most Guessed Words</ThemedText>
            {mostGuessedWords.length > 0 ? (
              <FlatList
                data={mostGuessedWords}
                renderItem={({ item, index }) => renderStatItem({ item, index, theme: themeRef.current as string })}
                keyExtractor={item => item.word}
              />
            ) : (
              <ThemedText>No guessed words data available.</ThemedText>
            )}
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Top 10 Players (Most Wins)</ThemedText>
            {topPlayers.length > 0 ? (
              <FlatList
                data={topPlayers}
                renderItem={({ item, index }) => renderStatItem({ item, index, theme: themeRef.current as string })}
                keyExtractor={(item) => item.user}
              />
            ) : (
              <ThemedText>No player stats available.</ThemedText>
            )}
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    flex: 1
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontStyle: 'italic'
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  wins: {
    fontSize: 16,
  },
});