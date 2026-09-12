import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist or has been moved.',
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <span className="text-8xl font-bold text-primary-500 font-display">404</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Page Not Found</h1>
        <p className="text-neutral-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved to a different location.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-all text-center"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 border-2 border-neutral-200 text-neutral-700 font-medium rounded-full hover:bg-neutral-50 transition-all text-center"
          >
            Back to Home
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-4 text-sm">
          <Link href="/dashboard/practice" className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="font-medium text-neutral-900">Practice</p>
          </Link>
          <Link href="/dashboard/results" className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="font-medium text-neutral-900">Results</p>
          </Link>
          <Link href="/dashboard/bookmarks" className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <p className="font-medium text-neutral-900">Bookmarks</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
