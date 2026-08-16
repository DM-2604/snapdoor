'use client';
// app/login/page.tsx — OTP login page
// Uses the /api/auth Route Handler which sets an httpOnly cookie.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

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
    // In dev bypass mode skip the OTP request entirely — just go to verify step
    if (IS_DEV_BYPASS) { setStep('otp'); return; }
    setLoading(true);
    // Auto-add +91 if it's exactly 10 digits (Indian standard)
    const formattedPhone = phone.replace(/\D/g, '').length === 10 && !phone.startsWith('+') 
      ? `+91${phone.replace(/\D/g, '')}` 
      : phone;

    try {
      await authApi.requestOtp(formattedPhone);
      setStep('otp');
      // Save formatted phone back so verify step uses it
      setPhone(formattedPhone);
    } catch (err: any) {
      setError(err.message ?? 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formattedPhone = phone.replace(/\D/g, '').length === 10 && !phone.startsWith('+') 
        ? `+91${phone.replace(/\D/g, '')}` 
        : phone;

      // POST to our Next.js Route Handler — sets httpOnly cookie server-side
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

      // Populate the auth store immediately — AdminLayoutClient will also hydrate
      // on mount from /api/session, but this avoids a name-display flash.
      if (data?.user) {
        useAuthStore.getState().login({
          id: data.user.id ?? '',
          phoneNumber: formattedPhone,
          name: data.user.name ?? null,
          role: data.user.role ?? 'ADMIN',
          adminRole: data.user.adminRole ?? null,
        });
      }

      // Cookie is now set httpOnly — navigate to dashboard
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 font-sans">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-700 rounded-2xl shadow-lg shadow-emerald-200 mb-5">
            <Leaf size={32} className="text-white drop-shadow-sm" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">LocalMart Admin</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to the Platform Console</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl p-8">

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
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  suppressHydrationWarning
                  className="w-full py-3.5 rounded-xl border border-neutral-300 bg-neutral-50 px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button 
                type="submit" 
                suppressHydrationWarning
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-100 transition-all mt-2 flex items-center justify-center gap-2" 
                disabled={loading}
              >
                {loading ? <><Spinner size={16} /> Sending OTP…</> : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500 mb-4">
                  Enter the 6-digit code sent to{' '}
                  <span className="font-medium text-neutral-800">{phone}</span>
                </p>
                <label htmlFor="otp" className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">
                  Verification code
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                  suppressHydrationWarning
                  className="w-full py-3.5 rounded-xl border border-neutral-300 bg-neutral-50 px-4 text-sm tracking-[0.3em] text-center font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button 
                type="submit" 
                suppressHydrationWarning
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-100 transition-all mt-2 flex items-center justify-center gap-2" 
                disabled={loading}
              >
                {loading ? <><Spinner size={16} /> Verifying…</> : 'Verify & Sign In'}
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

        <p className="text-center text-xs text-neutral-400 mt-6">
          Admin console · Phase 1 · LocalMart Platform
        </p>
      </div>
    </div>
  );
}
