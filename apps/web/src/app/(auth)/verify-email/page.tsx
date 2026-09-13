'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { showToast } from '@/lib/toast';
import { authApi } from '@/lib/api';

function VerifyEmailForm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Please check your email for the verification link.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await authApi.verifyEmail(token);
        setStatus('success');
        setMessage(response.message);
        showToast.success('Email verified!', 'Your email has been verified successfully.');
      } catch {
        setStatus('expired');
        setMessage('This verification link has expired or is invalid. Please request a new one.');
      }
    };

    verifyEmail();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-bold text-neutral-900">E</span>
            </div>
            <span className="text-3xl font-bold text-neutral-900 font-display">Examinery</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Verifying your email</h1>
          <p className="text-neutral-500">Please wait while we verify your email address...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-bold text-neutral-900">E</span>
            </div>
            <span className="text-3xl font-bold text-neutral-900 font-display">Examinery</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-2">Email verified!</h1>
          <p className="text-neutral-500 mb-6">{message}</p>

          <Link
            href="/login"
            className="w-full py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-all duration-200 inline-flex items-center justify-center"
          >
            Sign in to your account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 mb-8">
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center">
            <span className="text-3xl font-bold text-neutral-900">E</span>
          </div>
          <span className="text-3xl font-bold text-neutral-900 font-display">Examinery</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
        <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2">Verification failed</h1>
        <p className="text-neutral-500 mb-6">{message}</p>

        <Link
          href="/login"
          className="w-full py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-full hover:bg-neutral-200 transition-all duration-200 inline-flex items-center justify-center mb-4"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
