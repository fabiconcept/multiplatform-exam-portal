'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { paymentApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function MyKeyPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [keyData, setKeyData] = useState<{ key_code: string | null; exam_type?: string; is_used?: boolean; created_at?: string; message?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    paymentApi.getActivationKey(token)
      .then(setKeyData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const copyKey = () => {
    if (!keyData?.key_code) return;
    navigator.clipboard.writeText(keyData.key_code);
    setCopied(true);
    toast.success('Key copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatKey = (key: string) => {
    if (key.length === 16) {
      return `${key.slice(0, 4)}-${key.slice(4, 8)}-${key.slice(8, 12)}-${key.slice(12, 16)}`;
    }
    return key;
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-[#1a1a2e] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[#f59e0b]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">My Activation Key</h1>
        <p className="text-neutral-500 text-sm">Your personal activation key for Examinery Premium</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-neutral-200 p-10 text-center shadow-sm">
          <div className="w-14 h-14 border-4 border-neutral-200 border-t-[#1a1a2e] rounded-full animate-spin mx-auto mb-6" />
          <p className="text-sm text-neutral-500">Loading your key...</p>
        </div>
      ) : !keyData?.key_code ? (
        /* No key */
        <div className="bg-white rounded-3xl border border-neutral-200 p-10 text-center shadow-sm">
          <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">No Activation Key</h2>
          <p className="text-sm text-neutral-500 mb-6">
            {user?.is_banned
              ? 'Your account has been banned. Contact support for assistance.'
              : user?.is_active
                ? 'Your account is activated but no key was found. Contact support if this is unexpected.'
                : 'Complete a payment to receive your activation key.'}
          </p>
          {!user?.is_active && !user?.is_banned && (
            <button
              onClick={() => router.push('/dashboard/activate')}
              className="w-full py-3.5 bg-[#1a1a2e] text-white font-semibold rounded-2xl hover:bg-[#16162a] transition-all active:scale-[0.98]"
            >
              Activate Now
            </button>
          )}
        </div>
      ) : (
        /* Key display */
        <div className="space-y-4">
          {/* Key Card */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Your Key</p>
            <div
              onClick={copyKey}
              className="bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl p-6 text-center cursor-pointer hover:border-[#f59e0b] hover:bg-amber-50/50 transition-all group"
            >
              <p className="font-mono text-2xl font-bold tracking-[0.15em] text-neutral-900 group-hover:text-[#1a1a2e] select-all">
                {formatKey(keyData.key_code)}
              </p>
              <p className="text-xs text-neutral-400 mt-3">
                {copied ? (
                  <span className="text-green-600 font-medium">Copied!</span>
                ) : (
                  'Click to copy'
                )}
              </p>
            </div>
          </div>

          {/* Key Info */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Details</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Status</span>
                <span className={`font-semibold ${keyData.is_used ? 'text-neutral-400' : 'text-green-600'}`}>
                  {keyData.is_used ? 'Used' : 'Active'}
                </span>
              </div>
              {keyData.exam_type && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Exam Type</span>
                  <span className="font-medium text-neutral-900">{keyData.exam_type}</span>
                </div>
              )}
              {keyData.created_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Generated</span>
                  <span className="font-medium text-neutral-900">
                    {new Date(keyData.created_at).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* How to use */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">How to use</p>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Copy your key', desc: 'Click the key above to copy it to your clipboard' },
                { step: '2', title: 'Go to Activate', desc: 'Navigate to the Activate page from your dashboard' },
                { step: '3', title: 'Paste & Activate', desc: 'Paste your key and click Activate to unlock all features' },
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

          {/* Copy button */}
          <button
            onClick={copyKey}
            className="w-full py-3.5 bg-[#1a1a2e] text-white font-semibold rounded-2xl hover:bg-[#16162a] transition-all active:scale-[0.98]"
          >
            {copied ? 'Copied to Clipboard' : 'Copy Activation Key'}
          </button>
        </div>
      )}
    </div>
  );
}
