'use client';
import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth';

interface AuthContextType { isAuthenticated: boolean; isLoading: boolean; admin: { id: string; name: string; email: string; role: string } | null; }
const AuthContext = createContext<AuthContextType>({ isAuthenticated: false, isLoading: true, admin: null });
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const { admin, token, isLoading, loadAdmin } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (!hydrated) return;
    if (token && !admin) loadAdmin();
    else if (!token && isLoading) useAuthStore.setState({ isLoading: false });
  }, [hydrated, token, admin, loadAdmin, isLoading]);
  return <AuthContext.Provider value={{ isAuthenticated: !!token && !!admin, isLoading: isLoading || !hydrated, admin }}>{children}</AuthContext.Provider>;
}
