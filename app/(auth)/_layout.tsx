import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout () {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName='logIn'
    >
      <Stack.Screen name="logIn" />
      <Stack.Screen name="signUp" />
    </Stack>
  );
};