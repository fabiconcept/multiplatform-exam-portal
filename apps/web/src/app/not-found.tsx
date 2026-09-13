import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist or has been moved.',
};

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 md:pt-36 md:pb-24 min-h-[60vh] flex items-center">
        <div className="section-container w-full">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <span className="text-8xl font-bold text-primary-500 font-display">404</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Page not found</h1>
            <p className="text-neutral-500 mb-8">
              The page you are looking for does not exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-all text-center"
              >
                Back to home
              </Link>
              <Link
                href="/exams"
                className="w-full sm:w-auto px-6 py-3 border-2 border-neutral-200 text-neutral-700 font-medium rounded-full hover:bg-neutral-50 transition-all text-center"
              >
                Browse exams
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <Link href="/exams" className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="font-medium text-neutral-900">Exams</p>
              </Link>
              <Link href="/download" className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <p className="font-medium text-neutral-900">Download</p>
              </Link>
              <Link href="/pricing" className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-medium text-neutral-900">Pricing</p>
              </Link>
              <Link href="/contact" className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="font-medium text-neutral-900">Contact</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
