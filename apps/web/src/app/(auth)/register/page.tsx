'use client';

import { useState } from 'react';
import Link from 'next/link';

const exams = ['JAMB/UTME', 'WAEC/SSCE', 'Post-UTME', 'BECE', 'NCEE'];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    exam: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register:', formData);
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
            Start your{' '}
            <span className="text-accent-500">exam preparation</span>{' '}
            journey today.
          </h1>
          <p className="text-lg text-neutral-600 mb-8">
            Join 300,000+ students already using ExamScholars to ace their exams.
          </p>

          <div className="space-y-4">
            {[
              'Access 10,000+ past questions',
              'Practice offline without internet',
              'Track your progress and improve',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-neutral-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Register Form */}
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
            <h2 className="text-2xl font-bold mb-1">Create your account</h2>
            <p className="text-neutral-500 mb-8">Start your exam preparation journey today</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="exam" className="block text-sm font-medium text-neutral-700 mb-2">
                  Preparing for
                </label>
                <select
                  id="exam"
                  value={formData.exam}
                  onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select your exam</option>
                  {exams.map((exam) => (
                    <option key={exam} value={exam}>{exam}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input pr-12"
                    placeholder="Create a password"
                    required
                    minLength={8}
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
                <p className="text-xs text-neutral-400 mt-1">Must be at least 8 characters</p>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                  required
                />
                <label htmlFor="terms" className="text-sm text-neutral-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700">Privacy Policy</Link>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/20 active:scale-[0.98] transition-all duration-200"
              >
                Create account
              </button>
            </form>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-100" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-400">or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="py-3 px-4 border-2 border-neutral-100 rounded-full font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-200 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
                  <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z" />
                  <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z" />
                  <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="py-3 px-4 border-2 border-neutral-100 rounded-full font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-200 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Apple
              </button>
            </div>
          </div>

          <p className="text-center mt-6 text-neutral-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
