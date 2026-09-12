'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-background-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Something went wrong</h1>
            <p className="text-neutral-500 mb-6">
              An unexpected error occurred. Please try again or return to the dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={reset}
                className="w-full sm:w-auto px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-all"
              >
                Try Again
              </button>
              <a
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3 border-2 border-neutral-200 text-neutral-700 font-medium rounded-full hover:bg-neutral-50 transition-all text-center"
              >
                Go to Dashboard
              </a>
            </div>
            {error.digest && (
              <p className="text-xs text-neutral-400 mt-6">Error ID: {error.digest}</p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
