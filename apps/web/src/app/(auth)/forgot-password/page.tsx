'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { showToast } from '@/lib/toast';
import { authApi } from '@/lib/api';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    const loadingToast = showToast.loading('Sending reset link...');

    try {
      const response = await authApi.forgotPassword(data.email);
      showToast.dismiss(loadingToast);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      showToast.success('Check your email', response.message);
    } catch {
      showToast.dismiss(loadingToast);
      setIsSubmitted(true);
      setSubmittedEmail(data.email);
      showToast.info('Check your email', 'If an account exists with this email, you will receive a password reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-neutral-500 mb-6">
            We sent a password reset link to<br />
            <span className="font-medium text-neutral-900">{submittedEmail}</span>
          </p>

          <div className="bg-neutral-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-neutral-600">
              Didn&apos;t receive the email? Check your spam folder or try again with a different email address.
            </p>
          </div>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setSubmittedEmail('');
            }}
            className="w-full py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-full hover:bg-neutral-200 transition-all duration-200 mb-4"
          >
            Try a different email
          </button>

          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            Back to sign in
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
          <span className="text-3xl font-bold text-neutral-900 font-display">ExamScholars</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Forgot your password?</h1>
          <p className="text-neutral-500">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              Email address
            </label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  disabled={isLoading}
                  className={`input ${errors.email ? 'border-error-500 focus:ring-error-500' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="you@example.com"
                />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-neutral-600 hover:text-neutral-900 font-medium text-sm inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
