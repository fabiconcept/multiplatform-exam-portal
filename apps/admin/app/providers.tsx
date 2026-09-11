'use client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/auth-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider><Toaster position="top-right" />{children}</AuthProvider>;
}
