'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import toast from 'react-hot-toast';

interface ActivationModalProps {
  open: boolean;
  onClose: () => void;
  onActivated?: () => void;
  title?: string;
  subtitle?: string;
  showLimit?: number;
  showUsed?: number;
}

export function ActivationModal({
  open,
  onClose,
  onActivated,
  title = 'Unlock Full Access',
  subtitle,
  showLimit,
  showUsed,
}: ActivationModalProps) {
  const { token } = useAuthStore();
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'redeem' | 'buy'>('redeem');

  if (!open) return null;

  const handleActivate = async () => {
    if (!token || !key.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await authApi.activate(token, key.trim());
      useAuthStore.setState({ user: res.user });
      toast.success('Account activated! You now have unlimited access.');
      setKey('');
      onActivated?.();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Invalid activation key. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && key.trim()) handleActivate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-[#1a1a2e] px-8 pt-10 pb-10 text-center">
          <div className="w-14 h-14 bg-[#f59e0b] flex items-center justify-center mx-auto mb-4 rounded-2xl">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
          <p className="text-white/50 text-sm">{subtitle || 'One payment. Lifetime access.'}</p>

          {showLimit !== undefined && showUsed !== undefined && (
            <div className="mt-5 bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white/50">Free questions used</span>
                <span className="text-xs font-bold text-white">{showUsed} / {showLimit}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f59e0b] rounded-full"
                  style={{ width: `${Math.min(100, (showUsed / showLimit) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-8 -mt-5">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-1 flex">
            <button
              onClick={() => setTab('redeem')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === 'redeem' ? 'bg-[#1a1a2e] text-white shadow-md' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Have a Key
            </button>
            <button
              onClick={() => setTab('buy')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === 'buy' ? 'bg-[#1a1a2e] text-white shadow-md' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Get Key
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pt-6 pb-8">
          {tab === 'redeem' ? (
            <div>
              <div className="mb-4">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  maxLength={19}
                  className="w-full px-4 py-4 border-2 border-neutral-200 rounded-2xl text-center text-lg font-mono tracking-[0.2em] text-neutral-900 placeholder:text-neutral-300 focus:border-[#f59e0b] focus:ring-4 focus:ring-amber-100 transition-all outline-none uppercase"
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
                )}
              </div>

              <button
                onClick={handleActivate}
                disabled={loading || !key.trim()}
                className="w-full py-3.5 bg-[#1a1a2e] text-white font-semibold rounded-2xl hover:bg-[#16162a] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg active:scale-[0.98]"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Activating...
                  </span>
                ) : 'Activate Now'}
              </button>
            </div>
          ) : (
            <div>
              <div className="border-2 border-neutral-900 bg-white rounded-2xl p-5 mb-5">
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-sm font-semibold text-neutral-500">N</span>
                  <span className="text-3xl font-bold text-neutral-900">3,000</span>
                </div>
                <p className="text-center text-xs text-neutral-500">one-time payment</p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/dashboard/activate';
                }}
                className="w-full py-3.5 bg-[#1a1a2e] text-white font-semibold rounded-2xl hover:bg-[#16162a] transition-all shadow-lg active:scale-[0.98]"
              >
                Get Activation Key
              </button>
            </div>
          )}

          {/* Benefits */}
          <div className="mt-6 pt-5 border-t border-neutral-100">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">What you get</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Unlimited practice questions',
                'Full exam simulation',
                'Detailed explanations',
                'Performance analytics',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-neutral-600">
                  <svg className="w-4 h-4 text-[#f59e0b] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 py-2 text-sm text-neutral-400 font-medium hover:text-neutral-600 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
