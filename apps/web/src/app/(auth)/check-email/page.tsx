'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { showToast } from '@/lib/toast';
import { authApi } from '@/lib/api';

function CheckEmailContent() {
  const [isResending, setIsResending] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const handleResend = async () => {
    if (!email) {
      showToast.error('No email address', 'Please go back to register.');
      return;
    }

    setIsResending(true);
    const loadingToast = showToast.loading('Sending verification email...');

    try {
      await authApi.sendVerification(email);
      showToast.dismiss(loadingToast);
      showToast.success('Email sent!', 'A new verification email has been sent.');
    } catch {
      showToast.dismiss(loadingToast);
      showToast.error('Failed to send', 'Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 mb-8">
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center">
            <span className="text-3xl font-bold text-neutral-900">E</span>
          </div>
          <span className="text-3xl font-bold text-neutral-900 font-display">ExamScholars</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-neutral-500 mb-6">
          We&apos;ve sent a verification link to<br />
          <span className="font-medium text-neutral-900">{email || 'your email address'}</span>
        </p>

        <div className="bg-neutral-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-neutral-600">
            Click the link in the email to verify your account. The link expires in 24 hours.
          </p>
        </div>

        <button
          onClick={handleResend}
          disabled={isResending}
          className="w-full py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-full hover:bg-neutral-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
        >
          {isResending ? (
            <>
              <div className="w-4 h-4 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            'Resend verification email'
          )}
        </button>

        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  );
}
