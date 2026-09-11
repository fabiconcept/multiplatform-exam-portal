'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { Toaster } from 'react-hot-toast';
import { AuthGuard } from '@/components/auth-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background-100">
        <Sidebar />
        <main className="ml-64 min-h-screen">
          {children}
        </main>
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
      </div>
    </AuthGuard>
  );
}
