'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth';
import { loginSchema, type LoginInput } from '@/lib/validations';

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: LoginInput) => {
    const loadingToast = toast.loading('Signing you in...');

    try {
      const success = await login(data.email, data.password);
      toast.dismiss(loadingToast);

      if (success) {
        toast.success('Welcome back!', {
          description: 'Redirecting to your dashboard...',
        });
        setTimeout(() => router.push(redirect), 1000);
      } else {
        toast.error('Login failed', {
          description: 'Invalid email or password. Please try again.',
        });
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error('Something went wrong', {
        description: 'Please check your connection and try again.',
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Left - Branding */}
        <div className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-bold text-neutral-900">E</span>
            </div>
            <span className="text-3xl font-bold text-neutral-900 font-display">ExamScholars</span>
          </Link>
          
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-4 leading-tight">
            Prepare smarter.{' '}
            <span className="text-accent-500">Practise confidently.</span>
          </h1>
          <p className="text-lg text-neutral-600 mb-8">
            Sign in to access thousands of past questions, track your progress, and excel in your exams.
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-primary-500">300K+</p>
              <p className="text-xs text-neutral-500">Students</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-accent-500">10K+</p>
              <p className="text-xs text-neutral-500">Questions</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-success-500">5+</p>
              <p className="text-xs text-neutral-500">Exams</p>
            </div>
          </div>
        </div>

        {/* Right - Login Form */}
        <div>
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-neutral-900">E</span>
              </div>
              <span className="text-2xl font-bold text-neutral-900 font-display">ExamScholars</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
            <p className="text-neutral-500 mb-8">Sign in to continue your exam preparation</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className={`input ${errors.email ? 'border-error-500 focus:ring-error-500' : ''}`}
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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    {...register('password')}
                    className={`input pr-12 ${errors.password ? 'border-error-500 focus:ring-error-500' : ''}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>

          <p className="text-center mt-6 text-neutral-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
