'use client';

import { useEffect, createContext, useContext, type ReactNode } from 'react';
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

  useEffect(() => {
    if (token && !user) {
      loadUser();
    }
  }, [token, user, loadUser]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token && !!user,
        isLoading,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
