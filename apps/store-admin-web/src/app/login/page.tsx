'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, FlaskConical } from 'lucide-react';
import { useStoreOwnerAuthStore } from '@/stores/auth.store';
import { storeOwnerApi, authApi } from '@/lib/api';

const IS_DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_OTP_BYPASS === 'true';

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(IS_DEV_BYPASS ? '000000' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (IS_DEV_BYPASS) { setStep('otp'); return; }
    setLoading(true);
    const formattedPhone =
      phone.replace(/\D/g, '').length === 10 && !phone.startsWith('+')
        ? `+91${phone.replace(/\D/g, '')}`
        : phone;
    try {
      await authApi.requestOtp(formattedPhone);
      setPhone(formattedPhone);
      setStep('otp');
    } catch (err: any) {
      setError(err.message ?? 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formattedPhone =
        phone.replace(/\D/g, '').length === 10 && !phone.startsWith('+')
          ? `+91${phone.replace(/\D/g, '')}`
          : phone;

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhone, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? 'Verification failed');
        return;
      }
      if (data?.user) {
        useStoreOwnerAuthStore.getState().login({
          id: data.user.id ?? '',
          phoneNumber: formattedPhone,
          name: data.user.name ?? null,
          role: data.user.role ?? 'STORE_OWNER',
        });
      }
      
      try {
        const profile = await storeOwnerApi.getProfile();
        if (profile.status === 'LIVE') {
          router.replace('/dashboard');
        } else {
          router.replace('/kyc');
        }
      } catch (err) {
        // Fallback
        router.replace('/kyc');
      }

    } catch {
      setError('Unexpected error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-50 dark:bg-neutral-950 p-8 text-center border-b border-neutral-200 dark:border-neutral-800">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30">
            <Store size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white mb-1">GreenMart Seller</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Sign in to manage your store</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {/* Dev bypass banner */}
          {IS_DEV_BYPASS && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
              <FlaskConical size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-700">Dev bypass active</p>
                <p className="text-[11px] text-amber-600 mt-0.5">
                  OTP pre-filled as <code className="font-mono font-bold">000000</code>. Works for seeded numbers only.
                </p>
              </div>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  suppressHydrationWarning
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                suppressHydrationWarning
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-1.5">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                  Enter the 6-digit code sent to{' '}
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">{phone}</span>
                </p>
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  suppressHydrationWarning
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-center tracking-[0.4em] font-mono text-neutral-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                suppressHydrationWarning
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60"
              >
                {loading ? 'Verifying…' : 'Verify & Sign In'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('phone'); setError(''); setOtp(IS_DEV_BYPASS ? '000000' : ''); }}
                className="w-full text-sm text-neutral-500 hover:text-emerald-600 transition-colors"
              >
                ← Back to phone number
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
