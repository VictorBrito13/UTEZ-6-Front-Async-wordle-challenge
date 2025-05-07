import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { Link } from 'expo-router';
import { baseURL } from '@/helpers/baseUrl';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth/authContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function login() {
  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { setToken, authToken } = useAuth();

  // Functions
  const handleLogin = async () => {
    setErrorMessage('');

    try {
      const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.status >= 200 && data.status < 300) {
        // Store token in local storage or state management
        console.log('Login successful:', data);
        // Store token in local storage or state management
        await setToken(data.accessToken);
        // Navigate to main app
        console.log('token de accesso', authToken);
      } else if (data.status >= 400 && data.status < 500) {
        console.error('Login failed:', data);
        setErrorMessage(data.msg);
      } else {
        console.error('Login failed:', data);
        setErrorMessage('Invalid email or password.');
      }
    } catch (error: any) {
      console.error('Error during login:', error);
      setErrorMessage('An unexpected error occurred. Please check your network.');
    }
  };

  return (
    <ThemedView style={themedStyles.container}>
      <ThemedText style={themedStyles.title}>Log In</ThemedText>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={themedStyles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={themedStyles.input}
      />

      {errorMessage && <Text style={themedStyles.errorText}>{errorMessage}</Text>}

      <Button
        title='Log In'
        onPress={handleLogin}
      />

      <Link href="/(auth)/signUp" style={themedStyles.linkContainer}>
        <ThemedText style={themedStyles.linkText}>
          Don't have an account? Sign up
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