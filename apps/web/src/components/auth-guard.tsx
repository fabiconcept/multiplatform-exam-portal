'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './auth-provider';

const publicRoutes = ['/', '/login', '/register', '/exams', '/download', '/pricing', '/contact', '/about'];
const authRoutes = ['/login', '/register'];

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith('/exams/'));
  const isAuthRoute = authRoutes.includes(pathname);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isPublicRoute) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }

    if (isAuthenticated && isAuthRoute) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, isPublicRoute, isAuthRoute, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
