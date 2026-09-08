import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Dashboard',
  description: 'Your Fabi CBT dashboard',
};

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Fabi CBT</h1>
          <div className="flex gap-4">
            <a href="/student" className="text-gray-600 hover:text-gray-900">Dashboard</a>
            <a href="/student/exams" className="text-gray-600 hover:text-gray-900">Exams</a>
            <a href="/student/results" className="text-gray-600 hover:text-gray-900">Results</a>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
}
