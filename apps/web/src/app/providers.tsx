'use client';

import { type ReactNode, useEffect } from 'react';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from 'react-hot-toast';

function DarkModeInit() {
  useEffect(() => {
    // Only honor an explicit user choice — never auto-enable from OS preference.
    // Auto dark mode made Firefox render the navy theme while Chrome stayed light.
    const stored = localStorage.getItem('darkMode');
    if (stored === 'true') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      if (stored === null) {
        localStorage.setItem('darkMode', 'false');
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
