import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApiClient } from '@exam-portal/api-client';
import type { User } from '@exam-portal/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const api = createApiClient({
  baseUrl: API_URL,
  getToken: () => null,
  onUnauthorized: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await AsyncStorage.getItem('access_token');
      if (storedToken) {
        setToken(storedToken);
        const response = await api.auth.me();
        if (response.success && response.data) {
          setUser(response.data);
        }
      }
    } catch {} finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await api.auth.login({ email, password });
    if (response.success && response.data) {
      await AsyncStorage.setItem('access_token', response.data.accessToken);
      await AsyncStorage.setItem('refresh_token', response.data.refreshToken);
      setToken(response.data.accessToken);
      const meResponse = await api.auth.me();
      if (meResponse.success && meResponse.data) setUser(meResponse.data);
    } else {
      throw new Error(response.error || 'Login failed');
    }
  }

  async function register(name: string, email: string, password: string) {
    const response = await api.auth.register({ name, email, password });
    if (response.success && response.data) {
      await AsyncStorage.setItem('access_token', response.data.accessToken);
      await AsyncStorage.setItem('refresh_token', response.data.refreshToken);
      setToken(response.data.accessToken);
      const meResponse = await api.auth.me();
      if (meResponse.success && meResponse.data) setUser(meResponse.data);
    } else {
      throw new Error(response.error || 'Registration failed');
    }
  }

  async function logout() {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
