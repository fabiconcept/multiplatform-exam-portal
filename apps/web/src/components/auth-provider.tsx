'use client';

import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; name: string; email: string } | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, token, isLoading, loadUser } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (token && !user) {
      loadUser();
    } else if (!token && isLoading) {
      useAuthStore.setState({ isLoading: false });
    }
  }, [hydrated, token, user, loadUser, isLoading]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token && !!user,
        isLoading: isLoading || !hydrated,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
