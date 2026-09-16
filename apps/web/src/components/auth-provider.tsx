'use client';

import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import toast from 'react-hot-toast';

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

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, token, isLoading, loadUser } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (token) {
      setCookie('token', token, 30);
      if (!user) {
        loadUser().then((ok) => {
          if (!ok) {
            const publicRoutes = ['/', '/login', '/register', '/exams', '/download', '/pricing', '/contact', '/about'];
            const isPublic = publicRoutes.some((r) => pathname === r || pathname.startsWith('/exams/'));
            if (!isPublic) {
              toast.error('Session expired. Please log in again.');
              router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            }
          }
        });
      }
    } else {
      const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('token='));
      if (!hasCookie) {
        useAuthStore.setState({ isLoading: false });
      }
    }
  }, [hydrated, token, user, loadUser, router, pathname]);

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
