import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Favicon',
  description: 'Fabi CBT Favicon',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page not found</p>
        <a href="/" className="text-blue-600 mt-4 inline-block hover:underline">Go home</a>
      </div>
    </div>
  );
}
