'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ActivatePage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [key, setKey] = useState('');
  const [tab, setTab] = useState<'plans' | 'redeem'>('plans');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'payment' | 'done'>('select');

  const isActivated = user?.is_active;

  useEffect(() => {
    if (isActivated) {
      toast.error('Your account is already activated.');
      router.replace('/dashboard');
    }
  }, [isActivated, router]);

  if (isActivated) return null;

  async function handleRedeem() {
    if (!token || !key.trim()) return;
    setLoading(true);
    try {
      const res = await authApi.activate(token, key.trim());
      useAuthStore.setState({ user: res.user });
      toast.success('Account activated!');
      setKey('');
      setStep('done');
    } catch (e: any) {
      toast.error(e?.message || 'Invalid key');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-[#f59e0b] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Activation</h1>
        <p className="text-neutral-500 text-sm">One payment. Unlimited access to all features.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-neutral-100 rounded-2xl p-1 mb-8">
        <button
          onClick={() => { setTab('plans'); setStep('select'); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === 'plans' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Get Key
        </button>
        <button
          onClick={() => setTab('redeem')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === 'redeem' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Have a Key
        </button>
      </div>

      {tab === 'redeem' ? (
        /* ── Redeem Key ── */
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">Enter Activation Key</h2>
          <p className="text-sm text-neutral-500 mb-5">Enter the 16-character key you received after purchase.</p>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            maxLength={19}
            className="w-full px-4 py-4 border-2 border-neutral-200 rounded-2xl text-center text-lg font-mono tracking-[0.2em] text-neutral-900 placeholder:text-neutral-300 focus:border-[#f59e0b] focus:ring-4 focus:ring-amber-100 transition-all outline-none uppercase mb-4"
          />
          <button
            onClick={handleRedeem}
            disabled={loading || !key.trim()}
            className="w-full py-3.5 bg-[#1a1a2e] text-white font-semibold rounded-2xl hover:bg-[#16162a] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? 'Activating...' : 'Activate Now'}
          </button>
        </div>
      ) : step === 'done' ? (
        /* ── Success ── */
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center shadow-sm">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-1">You&apos;re All Set</h2>
          <p className="text-neutral-500 text-sm mb-6">Your account is now activated with unlimited access.</p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-[#1a1a2e] text-white font-semibold rounded-2xl hover:bg-[#16162a] transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      ) : step === 'payment' ? (
        /* ── Payment Details ── */
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Payment Details</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Bank</span>
                <span className="font-medium text-neutral-900">Opay</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Account Name</span>
                <span className="font-medium text-neutral-900">Exam Scholars</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Account Number</span>
                <span className="font-mono font-bold text-neutral-900">8123456789</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-neutral-100">
                <span className="text-neutral-500">Amount</span>
                <span className="font-bold text-lg text-neutral-900">N3,000</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">After Payment</p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Send your proof of payment via WhatsApp to{' '}
              <a href="https://wa.me/2348123456789" className="font-semibold text-neutral-900 underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                +234 812 345 6789
              </a>. Your activation key will be delivered within minutes.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('select')}
              className="flex-1 py-3 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-2xl hover:bg-neutral-50 transition-all text-sm"
            >
              Back
            </button>
            <button
              onClick={() => setTab('redeem')}
              className="flex-1 py-3 bg-[#1a1a2e] text-white font-semibold rounded-2xl hover:bg-[#16162a] transition-all text-sm"
            >
              I Have a Key
            </button>
          </div>
        </div>
      ) : (
        /* ── Plan Selection ── */
        <div className="space-y-4">
          {/* Price card */}
          <div className="bg-white rounded-3xl border-2 border-neutral-900 p-6 shadow-sm text-center">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Exam Scholars Premium</p>
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-sm font-semibold text-neutral-500">N</span>
              <span className="text-4xl font-bold text-neutral-900">3,000</span>
            </div>
            <p className="text-sm text-neutral-500">one-time payment</p>
          </div>

          {/* What you get */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">What you get</p>
            <div className="grid grid-cols-1 gap-3">
              {[
                'Unlimited practice questions',
                'Full exam simulation with timed sessions',
                'Detailed explanations for every answer',
                'Performance analytics & insights',
                'One-time payment — no subscriptions',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 text-sm text-neutral-700">
                  <svg className="w-4 h-4 text-[#f59e0b] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">How it works</p>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Make payment', desc: 'Transfer N3,000 to the bank details provided' },
                { step: '2', title: 'Receive your key', desc: 'We\'ll send your activation key via WhatsApp within minutes' },
                { step: '3', title: 'Activate', desc: 'Enter your key and start practicing immediately' },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="w-7 h-7 bg-neutral-100 text-neutral-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 text-sm">{item.title}</p>
                    <p className="text-sm text-neutral-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep('payment')}
            className="w-full py-3.5 bg-[#1a1a2e] text-white font-semibold rounded-2xl hover:bg-[#16162a] transition-all active:scale-[0.98]"
          >
            Proceed to Payment
          </button>

          <p className="text-xs text-center text-neutral-400">
            Need help?{' '}
            <a href="https://wa.me/2348123456789" className="text-neutral-600 underline underline-offset-2" target="_blank" rel="noopener noreferrer">
              WhatsApp us
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
