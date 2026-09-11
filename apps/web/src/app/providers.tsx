'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
