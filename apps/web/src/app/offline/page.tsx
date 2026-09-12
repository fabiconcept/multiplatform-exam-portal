export const metadata = {
  title: 'Offline',
  description: 'You are currently offline. Please check your internet connection.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 00-7.072 0m7.072 0l-2.121 2.121m2.121-2.121l2.121 2.121M3 12a9 9 0 019-9m0 0a9 9 0 019 9m-9-9v.01" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">You&apos;re Offline</h1>
        <p className="text-neutral-500 mb-6">
          It looks like you&apos;ve lost your internet connection. Please check your network and try again.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-all"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="block w-full py-3 border-2 border-neutral-200 text-neutral-700 font-medium rounded-full hover:bg-neutral-50 transition-all"
          >
            Go to Dashboard
          </a>
        </div>
        <div className="mt-8 p-4 bg-white rounded-2xl shadow-sm">
          <h3 className="font-semibold text-neutral-900 mb-2">While you&apos;re offline:</h3>
          <ul className="text-sm text-neutral-600 space-y-1 text-left">
            <li>• Previously viewed pages may still be accessible</li>
            <li>• Your progress is saved locally</li>
            <li>• Practice sessions will sync when you reconnect</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
