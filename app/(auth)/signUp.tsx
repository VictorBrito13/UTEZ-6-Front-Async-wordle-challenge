import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { TextInput } from 'react-native-gesture-handler';
import { baseURL } from '@/helpers/baseUrl';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedInput } from '@/components/ThemedInput';

export default function signUp() {
  // States
  const [email, setEmail] = useState('test3@test.com');
  const [username, setUsername] = useState('test3');
  const [password, setPassword] = useState('1234');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  // Functions
  const handleSignUp = async () => {

    // Validate input fields
    if (!email || !username || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    setErrorMessage('');

    try {
      const response = await fetch(`${baseURL}/user/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      const data = await response.json();

      if (data.status >= 200 && data.status < 300) {
        // Navigate to login screen
        router.navigate('/(auth)/logIn')
      } else if(data.status >= 400 && data.status < 500) {
        console.error('Sign up failed:', data);
        setErrorMessage(data.msg);
      } else {
        console.error('Sign up failed:', data);
        setErrorMessage('Failed to create account. Please try again.');
      }

    } catch (error: any) {
      console.error('Error during sign up:', error);
      setErrorMessage('An unexpected error occurred. Please check your network.');
    }
  };

  return (
    <ThemedView style={themedStyles.container}>
      <ThemedText style={themedStyles.title}>Create Account</ThemedText>

      <ThemedInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={themedStyles.input}
      />

      <ThemedInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={themedStyles.input}
      />

      <ThemedInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={themedStyles.input}
      />

      {errorMessage && <Text style={themedStyles.errorText}>{errorMessage}</Text>}

      <Button
        title='Create Account'
        onPress={handleSignUp}
      />

      <Link href="/(auth)/logIn" style={themedStyles.linkContainer}>
        <ThemedText style={themedStyles.linkText}>
          Already have an account? Log in
        </ThemedText>
      </Link>
    </ThemedView>
  )
}

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: 'blue',
    fontSize: 16,
  },
});