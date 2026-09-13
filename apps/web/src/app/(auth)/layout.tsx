import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Examinery account',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </div>
      <footer className="py-6 text-center text-sm text-neutral-500">
        <p>&copy; {new Date().getFullYear()} Examinery. All rights reserved.</p>
      </footer>
    </div>
  );
}
