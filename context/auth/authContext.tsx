// AuthContext.js (Shared code)
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  authToken: string;
  setToken(value: string): Promise<void>;
  clearToken(): Promise<void>;
  loadingToken: boolean;
};

const AuthContext = createContext<AuthContextType>({
  authToken: '',
  setToken: async () => { },
  clearToken: async () => { },
  loadingToken: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string>('');
  const [loadingToken, setLoadingToken] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      let storedToken = '';
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        try {
          storedToken = await AsyncStorage.getItem('authToken') || '';
        } catch (error) {
          console.log('Error retrieving token from SecureStore:', error);
        }
      } else if (Platform.OS === 'web') {
        storedToken = localStorage.getItem('authToken') || '';
      }
      setAuthToken(storedToken);
      setLoadingToken(false);
    };

    loadToken();
  }, []);

  const setToken = async (token: string) => {
    setAuthToken(token);
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await AsyncStorage.setItem('authToken', token);
    } else if (Platform.OS === 'web') {
      localStorage.setItem('authToken', token);
    }
  };

  const clearToken = async () => {
    setAuthToken('');
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await AsyncStorage.removeItem('authToken');
    } else if (Platform.OS === 'web') {
      localStorage.removeItem('authToken');
    }
  };

  const value = { authToken, setToken, clearToken, loadingToken };

  return (
    <AuthContext.Provider value={value}>
      {!loadingToken && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);