import React from 'react';
import { Stack } from 'expo-router';

export default function GameLayout () {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName='stats'
    >
      <Stack.Screen name="match" />
      <Stack.Screen name="stats" />
    </Stack>
  );
};