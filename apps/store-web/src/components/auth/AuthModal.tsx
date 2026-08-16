"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Phone, Loader2, UserX, ArrowLeft, RefreshCw } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { customerApi } from "@/lib/customer-api";

export const AuthModal = () => {
  const { showAuthModal, authStep, pendingPhone, closeAuthModal, login, setGuest, setAuthStep } =
    useAuthStore();
  const { mergeGuestCart } = useCartStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  // After login, redirect to /checkout if that's where they came from
  const redirectAfterLogin = searchParams.get('checkout') === 'pending' ? '/checkout' : null;

  const [activeTab, setActiveTab] = useState<"phone" | "google" | "guest">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start resend countdown when OTP step is active
  useEffect(() => {
    if (authStep === "otp") {
      setResendTimer(30);
      timerRef.current = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [authStep]);

  // Auto-focus first OTP input
  useEffect(() => {
    if (authStep === "otp") {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [authStep]);

  if (!showAuthModal) return null;

  const handleSendOtp = async () => {
    if (phone.length < 10) { setError("Enter a valid 10-digit phone number"); return; }
    setIsLoading(true);
    setError("");
    try {
      const normalizedPhone = phone.replace(/\D/g, '');
      const e164Phone = normalizedPhone.startsWith('91') && normalizedPhone.length === 12
        ? `+${normalizedPhone}`
        : `+91${normalizedPhone}`;
      const res = await customerApi.requestOtp(e164Phone);
      const data = await res.json();
      if (!res.ok) { setError(data?.message ?? "Failed to send OTP"); return; }
      setAuthStep("otp", e164Phone);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpInput = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value.slice(-1);
    setOtp(newOtp);
    if (value && idx < 5) otpRefs.current[idx + 1]?.focus();
    // Auto-submit when all 6 filled
    if (newOtp.every((d) => d) && newOtp.join("").length === 6) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode?: string) => {
    const code = otpCode ?? otp.join("");
    if (code.length < 6) { setError("Enter the 6-digit OTP"); return; }
    setIsLoading(true);
    setError("");
    try {
      const rawPhone = pendingPhone.replace(/\D/g, '');
      const phoneNumber = rawPhone.startsWith('91') && rawPhone.length === 12
        ? `+${rawPhone}`
        : `+91${rawPhone}`;
      const result = await customerApi.verifyOtp(phoneNumber, code);
      if ((result as any)?.message) { setError((result as any).message); return; }
      if (result?.user) {
        login({ id: result.user.id, phoneNumber: result.user.phoneNumber, name: result.user.name, role: result.user.role });
        closeAuthModal();
        // Merge guest cart then redirect if needed
        await mergeGuestCart().catch(() => {});
        if (redirectAfterLogin) router.push(redirectAfterLogin);
      }
    } catch {
      setError("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Dev-bypass: +919999999999 / 000000 → creates a real DB user + sets httpOnly cookie
      await customerApi.requestOtp('+919999999999');
      const result = await customerApi.verifyOtp('+919999999999', '000000');
      if (result?.user) {
        login({
          id: result.user.id,
          phoneNumber: result.user.phoneNumber,
          name: result.user.name ?? 'Dev User',
          role: result.user.role,
        });
        closeAuthModal();
        await mergeGuestCart().catch(() => {});
        if (redirectAfterLogin) router.push(redirectAfterLogin);
      } else {
        setError('Dev login returned no user. Check backend logs.');
      }
    } catch {
      // NO FALLBACK — if backend is down, stay as guest
      setError('Dev login failed. Is the API running on port 3000?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = () => {
    setGuest();
    closeAuthModal();
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    await handleSendOtp();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {authStep === "otp" && (
              <button
                onClick={() => { setAuthStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                {authStep === "otp" ? "Verify OTP" : "Sign in / Sign up"}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {authStep === "otp"
                  ? `OTP sent to +91 ${pendingPhone}`
                  : "Access your orders and wishlist"}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs (only on phone step) */}
        {authStep === "phone" && (
          <div className="flex border-b border-neutral-100 dark:border-neutral-800">
            {(["phone", "google", "guest"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setError(""); }}
                className={`flex-1 py-3 text-xs font-bold transition-colors capitalize ${
                  activeTab === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700"
                }`}
              >
                {tab === "phone" ? "📱 Phone" : tab === "google" ? "🌐 Google" : "👤 Guest"}
              </button>
            ))}
          </div>
        )}

        <div className="p-6 space-y-4">

          {/* ── Phone Tab: Step 1 ── */}
          {authStep === "phone" && activeTab === "phone" && (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <Phone size={16} className="text-neutral-400" />
                  <span className="ml-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 border-r border-neutral-300 dark:border-neutral-600 pr-2">+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className="w-full pl-20 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-neutral-900 dark:text-white placeholder:text-neutral-400"
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                onClick={handleSendOtp}
                disabled={isLoading || phone.length < 10}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-md shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                Send OTP
              </button>

              {process.env.NODE_ENV !== "production" && (
                <button
                  onClick={handleMockLogin}
                  className="w-full py-2 border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 text-xs rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  🛠 Mock Login (Dev only)
                </button>
              )}
            </div>
          )}

          {/* ── OTP Step ── */}
          {authStep === "otp" && (
            <div className="space-y-5">
              <div className="flex gap-2 justify-center">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInput(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 text-center text-xl font-bold bg-neutral-50 dark:bg-neutral-950 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-neutral-900 dark:text-white transition-all"
                  />
                ))}
              </div>
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              <button
                onClick={() => handleVerifyOtp()}
                disabled={isLoading || otp.join("").length < 6}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-md shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                Verify OTP
              </button>
              <div className="text-center">
                {resendTimer > 0 ? (
                  <span className="text-xs text-neutral-400">Resend OTP in {resendTimer}s</span>
                ) : (
                  <button onClick={handleResend} className="text-xs text-primary font-semibold flex items-center gap-1 mx-auto hover:underline">
                    <RefreshCw size={12} /> Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Google Tab ── */}
          {authStep === "phone" && activeTab === "google" && (
            <div className="space-y-4">
              <button
                onClick={() => setError("Google Sign-In coming soon 🚧")}
                className="w-full flex items-center justify-center gap-3 py-3 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 font-semibold rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors shadow-xs"
              >
                <FaGoogle size={18} className="text-red-500" />
                Continue with Google
              </button>
              {error && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-400 text-center">
                  {error}
                </div>
              )}
              {process.env.NODE_ENV !== "production" && (
                <button
                  onClick={handleMockLogin}
                  className="w-full py-2 border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 text-xs rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  🛠 Mock Login (Dev only)
                </button>
              )}
            </div>
          )}

          {/* ── Guest Tab ── */}
          {authStep === "phone" && activeTab === "guest" && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-2">
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">As a guest you can:</p>
                <ul className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                  <li className="flex items-center gap-2">✅ Browse all stores & products</li>
                  <li className="flex items-center gap-2">✅ Add items to cart</li>
                  <li className="flex items-center gap-2">🔒 Checkout requires sign in</li>
                </ul>
              </div>
              <button
                onClick={handleGuestContinue}
                className="w-full flex items-center justify-center gap-2 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <UserX size={16} />
                Continue as Guest
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
