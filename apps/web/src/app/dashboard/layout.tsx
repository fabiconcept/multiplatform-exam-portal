'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { AuthGuard } from '@/components/auth-guard';
import { ErrorBoundary } from '@/components/error-boundary';
import { KeyboardShortcutsModal } from '@/components/keyboard-shortcuts-modal';
import { RouteProgress } from '@/components/route-progress';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background-100">
        <RouteProgress />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Sidebar />
        <main id="main-content" className="lg:ml-64 min-h-screen" role="main">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <KeyboardShortcutsModal />
      </div>
    </AuthGuard>
  );
}
