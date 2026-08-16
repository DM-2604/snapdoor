"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { MockPaymentModal } from "@/components/checkout/MockPaymentModal";
import {
  MapPin,
  Lock,
  Truck,
  Zap,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Store,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { useQuery } from "@tanstack/react-query";
import { customerApi, CheckoutDto } from "@/lib/customer-api";

export default function CheckoutPage() {
  const router = useRouter();
  const cartStore = useCartStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();

  // Generated once per checkout mount — stable across retries
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'PAY_AT_PICKUP'>('PAY_AT_PICKUP');
  const [contact, setContact] = useState({ name: '', phone: '', addressLine: '' });
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const storeId = cartStore.storeId;
  const { data: storeDetails } = useQuery({
    queryKey: ["store", storeId],
    queryFn: () => customerApi.storeDetails(storeId!),
    enabled: !!storeId,
  });
  const isStoreClosed = storeDetails && !storeDetails.isOpen;

  const subtotal = cartStore.items.reduce(
    (sum, item) => sum + Number(item.priceAtTime) * item.quantity,
    0,
  );
  const gstAmount = cartStore.items.reduce(
    (sum, item) =>
      sum + (Number(item.priceAtTime) * item.quantity * Number(item.gstRatePercent ?? 0)) / 100,
    0,
  );
  const grandTotal = subtotal + gstAmount - cartStore.totalDiscount;

  const handlePlaceOrder = async () => {
    if (!cartStore.storeId) return;
    if (!contact.name || !contact.phone) {
      setError('Please fill in your name and phone number.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const dto: CheckoutDto = {
        storeId: cartStore.storeId,
        fulfillmentType: 'TAKEAWAY',
        paymentMethod,
        customerContact: {
          name: contact.name,
          phone: contact.phone,
          addressLine: contact.addressLine || undefined,
        },
      };

      const res = await customerApi.checkout(dto, idempotencyKey);

      if (res.requiresPayment) {
        // UPI / CARD — show mock payment modal
        setPendingPaymentId(res.paymentId);
        setShowPaymentModal(true);
        return; // wait for modal confirmation
      }

      // PAY_AT_PICKUP — no gateway step needed
      await cartStore.clearCart();
      router.push(`/account/orders/${res.orderId}?confirmed=true`);
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: Record<string, unknown> }; message?: string };
      if (anyErr?.response?.data?.code === 'INSUFFICIENT_STOCK') {
        if (cartStore.storeId) {
          cartStore.fetchCart(cartStore.storeId);
        }
        setError('Some items ran out of stock. Cart has been updated. Please review and try again.');
        router.push('/cart');
      } else {
        setError(
          (anyErr?.response?.data?.message as string) ??
          anyErr?.message ??
          'Something went wrong. Please try again.',
        );
        // idempotencyKey is stable — retry is safe, no duplicate order created
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirm = async (mockToken: string) => {
    if (!pendingPaymentId) return;
    setLoading(true);
    try {
      await customerApi.confirmPayment(pendingPaymentId, mockToken);
      await cartStore.clearCart();
      router.push('/account/orders?confirmed=true');
    } catch {
      setError('Payment confirmation failed. Please try again.');
    } finally {
      setLoading(false);
      setShowPaymentModal(false);
    }
  };

  // Auth gate: redirect to home with checkout intent so AuthModal can redirect back
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-20">
          <div className="text-center space-y-2">
            <div className="text-5xl">🔒</div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Sign in to checkout</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Please log in to complete your order</p>
          </div>
          <button
            onClick={() => {
              // Open auth modal — after login, AuthModal reads checkout=pending from URL
              // and redirects back to /checkout
              router.replace('/?checkout=pending');
              openAuthModal();
            }}
            className="px-8 py-3 bg-primary text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors"
          >
            Sign In / Sign Up
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />

      {showPaymentModal && (
        <MockPaymentModal
          onConfirm={handlePaymentConfirm}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <Link href="/cart" className="hover:text-primary">Cart</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-white font-bold">Checkout</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">

            {/* Contact Form */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-extrabold text-neutral-900 dark:text-white text-sm">
                <MapPin size={18} className="text-primary" />
                <h3>Contact Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 text-[11px]">Full Name *</label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none focus:border-primary text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 text-[11px]">Phone Number *</label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none focus:border-primary text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700 dark:text-neutral-300 text-[11px]">Address (Optional — for delivery orders)</label>
                <input
                  type="text"
                  value={contact.addressLine}
                  onChange={(e) => setContact((c) => ({ ...c, addressLine: e.target.value }))}
                  placeholder="Street, area, landmark"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none focus:border-primary text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-neutral-700 dark:text-neutral-300 text-[11px]">Delivery Instructions (Optional)</label>
                <textarea
                  rows={2}
                  maxLength={150}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="E.g. Please ring the bell, leave near the gate, etc."
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none focus:border-primary text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 resize-none"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2 font-extrabold text-neutral-900 dark:text-white text-sm">
                  <Lock size={18} className="text-primary" />
                  <h3>Payment Method</h3>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck size={14} />
                  <span>100% Secure</span>
                </div>
              </div>

              <div className="space-y-3">

                {/* PAY_AT_PICKUP */}
                <div
                  onClick={() => setPaymentMethod('PAY_AT_PICKUP')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'PAY_AT_PICKUP'
                      ? 'border-primary bg-emerald-50/40'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'PAY_AT_PICKUP' ? 'border-primary bg-primary' : 'border-neutral-400'}`}>
                      {paymentMethod === 'PAY_AT_PICKUP' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <Store size={18} className="text-emerald-600" />
                    <div>
                      <span className="font-extrabold text-neutral-900 dark:text-white text-xs block">Pay at Store</span>
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400">No advance payment required</span>
                    </div>
                  </div>
                  {paymentMethod === 'PAY_AT_PICKUP' && (
                    <div className="mt-3 ml-7 text-[11px] text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-3 py-2 font-medium">
                      💚 Pay at the store counter when you pick up your order. No advance payment required.
                    </div>
                  )}
                </div>

                {/* UPI */}
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-primary bg-emerald-50/40'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'UPI' ? 'border-primary bg-primary' : 'border-neutral-400'}`}>
                        {paymentMethod === 'UPI' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <Smartphone size={18} className="text-purple-600" />
                      <span className="font-extrabold text-neutral-900 dark:text-white text-xs">UPI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-black text-blue-600">GPay</span>
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-black text-purple-700">PhonePe</span>
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-black text-cyan-600">Paytm</span>
                    </div>
                  </div>
                </div>

                {/* CARD */}
                <div
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-primary bg-emerald-50/40'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'CARD' ? 'border-primary bg-primary' : 'border-neutral-400'}`}>
                        {paymentMethod === 'CARD' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <CreditCard size={18} className="text-blue-600" />
                      <span className="font-extrabold text-neutral-900 dark:text-white text-xs">Credit / Debit Card</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-black text-blue-800">VISA</span>
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-black text-red-600">MC</span>
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-black text-emerald-700">RuPay</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-3 text-emerald-900 text-[11px]">
                <ShieldCheck size={24} className="text-primary shrink-0" />
                <div>
                  <h5 className="font-bold">Safe &amp; Secure Payments</h5>
                  <p className="text-[10px] text-neutral-600 dark:text-neutral-400">Your payment information is 100% secure and encrypted.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4 sticky top-24">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">Order Summary</h3>
                <Link href="/cart" className="text-primary font-bold text-xs hover:underline">Edit Cart</Link>
              </div>

              {/* Items preview */}
              <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar pr-1">
                {cartStore.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-neutral-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🛍️</span>
                      <div>
                        <h5 className="font-bold text-neutral-800 dark:text-neutral-100 line-clamp-1">{item.productName}</h5>
                        <p className="text-[10px] text-neutral-400">{item.variantName} • Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-neutral-900 dark:text-white">
                      ₹{(Number(item.priceAtTime) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="space-y-2 pt-3 border-t border-neutral-200 dark:border-neutral-800/80 text-xs">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                {gstAmount > 0 && (
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>GST</span>
                    <span className="font-bold text-neutral-900 dark:text-white">₹{gstAmount.toFixed(2)}</span>
                  </div>
                )}
                {cartStore.totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>− ₹{cartStore.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 block">Total Amount</span>
                  <span className="text-xl font-black text-neutral-900 dark:text-white">₹{grandTotal.toFixed(2)}</span>
                </div>
                {cartStore.totalDiscount > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    ₹{cartStore.totalDiscount.toFixed(2)} saved
                  </span>
                )}
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-3 py-2 text-[11px] text-danger font-medium">
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={loading || cartStore.items.length === 0 || isStoreClosed}
                className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-extrabold text-sm rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Lock size={16} />
                <span>{isStoreClosed ? 'Store Closed' : loading ? 'Placing Order…' : 'Place Order'}</span>
              </button>

              {isStoreClosed && (
                <p className="text-danger text-xs font-bold text-center mt-2">
                  This store is currently closed and not accepting orders.
                </p>
              )}

              <p className="text-[10px] text-center text-neutral-400">
                By placing this order, you agree to our{' '}
                <Link href="/support?tab=terms" className="underline hover:text-primary">Terms &amp; Conditions</Link>
                {' '}&amp;{' '}
                <Link href="/support?tab=privacy" className="underline hover:text-primary">Privacy Policy</Link>
              </p>
            </div>
          </div>

        </div>

      </div>

      <Footer />
    </main>
  );
}
