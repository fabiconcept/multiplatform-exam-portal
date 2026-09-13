'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { paymentApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('ref');
  const token = useAuthStore((s) => s.token);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'failed' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(0);
  const [keyCode, setKeyCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status !== 'idle') return;
    if (!token || !reference) {
      setStatus('error');
      setMessage(reference ? 'You must be logged in to verify payment.' : 'No payment reference found.');
      return;
    }

    setStatus('loading');

    paymentApi.verifyPayment(token, reference)
      .then((res) => {
        setStatus(res.activated ? 'success' : 'failed');
        setMessage(res.message);
        setAmount(res.amount);
        if (res.key_code) setKeyCode(res.key_code);
      })
      .catch((err) => {
        setStatus('failed');
        setMessage(err?.message || 'Payment verification failed. Please try again.');
      });
  }, [token, reference, status]);

  const copyKey = () => {
    if (!keyCode) return;
    navigator.clipboard.writeText(keyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatKey = (key: string) => {
    if (key.length === 16) {
      return `${key.slice(0, 4)}-${key.slice(4, 8)}-${key.slice(8, 12)}-${key.slice(12, 16)}`;
    }
    return key;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {status === 'loading' && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-10 text-center shadow-sm">
            <div className="w-14 h-14 border-4 border-neutral-200 border-t-[#1a1a2e] rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-bold text-neutral-900 mb-2">Verifying Payment</h1>
            <p className="text-sm text-neutral-500">Please wait while we confirm your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-10 text-center shadow-sm">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 mb-2">Payment Successful</h1>
            <p className="text-sm text-neutral-500 mb-1">Your account has been activated.</p>
            <p className="text-xs text-neutral-400 mb-6">Amount: N{(amount / 100).toLocaleString()}</p>

            {keyCode && (
              <div className="mb-6">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Your Activation Key</p>
                <div
                  onClick={copyKey}
                  className="bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl p-4 cursor-pointer hover:border-[#f59e0b] hover:bg-amber-50/50 transition-all"
                >
                  <p className="font-mono text-xl font-bold tracking-[0.15em] text-neutral-900 select-all">
                    {formatKey(keyCode)}
                  </p>
                  <p className="text-xs text-neutral-400 mt-2">
                    {copied ? (
                      <span className="text-green-600 font-medium">Copied!</span>
                    ) : (
                      'Click to copy'
                    )}
                  </p>
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  We&apos;ve also emailed this key to you.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Link
                href="/dashboard/my-key"
                className="flex-1 py-3 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-2xl hover:bg-neutral-50 transition-all text-sm text-center"
              >
                View My Key
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 py-3 bg-[#1a1a2e] text-white font-semibold rounded-2xl hover:bg-[#16162a] transition-all text-sm text-center"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-10 text-center shadow-sm">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 mb-2">Payment Failed</h1>
            <p className="text-sm text-neutral-500 mb-6">{message}</p>
            <div className="flex gap-3">
              <Link
                href="/dashboard/activate"
                className="flex-1 py-3 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-2xl hover:bg-neutral-50 transition-all text-sm text-center"
              >
                Try Again
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 py-3 bg-[#1a1a2e] text-white font-semibold rounded-2xl hover:bg-[#16162a] transition-all text-sm text-center"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-10 text-center shadow-sm">
            <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-neutral-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 mb-2">Something Went Wrong</h1>
            <p className="text-sm text-neutral-500 mb-6">{message}</p>
            <Link
              href="/dashboard/activate"
              className="inline-block w-full py-3.5 bg-[#1a1a2e] text-white font-semibold rounded-2xl hover:bg-[#16162a] transition-all active:scale-[0.98]"
            >
              Back to Activation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-neutral-200 border-t-[#1a1a2e] rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
