'use client';

import { type ReactNode, useEffect } from 'react';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from 'react-hot-toast';

function DarkModeInit() {
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored === 'true') {
      document.documentElement.classList.add('dark');
    } else if (stored === null) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      }
    }
  }, []);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DarkModeInit />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#00C355',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF3333',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
