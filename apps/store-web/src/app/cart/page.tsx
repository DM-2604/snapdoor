"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { CrossStoreConflictModal } from "@/components/cart/CrossStoreConflictModal";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  ChevronRight,
  Tag,
} from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/lib/customer-api";

export default function CartPage() {
  const router = useRouter();
  const store = useCartStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    router.push("/checkout");
  };

  const storeId = store.storeId;
  const { data: storeDetails } = useQuery({
    queryKey: ["store", storeId],
    queryFn: () => customerApi.storeDetails(storeId!),
    enabled: !!storeId,
  });

  const isStoreClosed = storeDetails && !storeDetails.isOpen;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      await store.applyCoupon(couponInput.trim().toUpperCase());
    } catch {
      setCouponError("Invalid or expired coupon code.");
    } finally {
      setCouponLoading(false);
    }
  };

  // Derived totals from server-synced items
  const subtotal = store.items.reduce(
    (sum, item) => sum + Number(item.priceAtTime) * item.quantity,
    0,
  );
  const gstAmount = store.items.reduce(
    (sum, item) =>
      sum + (Number(item.priceAtTime) * item.quantity * Number(item.gstRatePercent ?? 0)) / 100,
    0,
  );
  const grandTotal = subtotal + gstAmount - store.totalDiscount;

  const freeDeliveryThreshold = 499;
  const progressPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);
  const amountNeeded = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />

      {/* Cross-store conflict modal */}
      {store.crossStoreConflict && (
        <CrossStoreConflictModal
          storeName={store.crossStoreConflict.existingStoreName}
          onConfirm={store.confirmCrossStoreClear}
          onDismiss={store.dismissConflict}
        />
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-white font-bold">Shopping Cart</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 space-y-6">

        {/* Free Delivery Progress Banner */}
        <div className="bg-white dark:bg-neutral-900 border border-emerald-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white text-xs">
              <Truck size={18} className="text-primary" />
              {amountNeeded > 0 ? (
                <span>
                  Add <strong className="text-primary font-black">₹{amountNeeded.toFixed(0)}</strong> more to get <strong className="text-emerald-700 font-black">FREE Delivery!</strong>
                </span>
              ) : (
                <span className="text-emerald-700 font-black flex items-center gap-1">
                  🎉 Congratulations! You unlocked FREE Delivery!
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">₹{subtotal.toFixed(0)}/₹{freeDeliveryThreshold}</span>
          </div>

          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {store.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-neutral-400">
            <span className="text-6xl">🛒</span>
            <p className="font-bold text-neutral-600 dark:text-neutral-400 text-sm">Your cart is empty</p>
            <Link href="/shops" className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark transition-colors">
              Browse Stores
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Cart Items Column */}
            <div className="lg:col-span-8 space-y-4">

              {/* Items List */}
              <div className="space-y-3">
                {store.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-neutral-50 dark:bg-neutral-950 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        🛍️
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">{item.productName}</h4>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{item.variantName}</p>
                        {item.gstRatePercent ? (
                          <p className="text-[10px] text-neutral-400">GST {item.gstRatePercent}%</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-neutral-100 dark:border-neutral-800">
                      <div className="text-right">
                        <span className="font-black text-sm text-neutral-900 dark:text-white block">
                          ₹{(Number(item.priceAtTime) * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-neutral-400">₹{Number(item.priceAtTime).toFixed(2)} each</span>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                        <button
                          onClick={() => store.updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-neutral-900 shadow-2xs hover:bg-neutral-200 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-bold"
                          disabled={store.isLoading}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-extrabold text-neutral-900 dark:text-white w-4 text-center text-xs">{item.quantity}</span>
                        <button
                          onClick={() => store.updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-neutral-900 shadow-2xs hover:bg-neutral-200 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-bold"
                          disabled={store.isLoading}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => store.removeItem(item.id)}
                        className="text-neutral-400 hover:text-danger p-1"
                        disabled={store.isLoading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Applied Offer Badge */}
              {store.appliedOffer && (
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-3">
                  <Tag size={16} className="text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                    🎉 {store.appliedOffer.title} — ₹{store.appliedOffer.discountAmount} off applied!
                  </span>
                </div>
              )}

              {/* Coupon Input */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 shadow-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-neutral-800 dark:text-neutral-100 text-xs">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Have a coupon code?</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 uppercase bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs outline-none focus:border-primary text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-mono"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {couponLoading ? 'Applying…' : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-danger font-medium">{couponError}</p>
                )}
              </div>

            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4 sticky top-24">
                <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm border-b border-neutral-100 dark:border-neutral-800 pb-3">Order Summary</h3>

                <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex justify-between">
                    <span>Subtotal ({store.items.length} items)</span>
                    <span className="font-bold text-neutral-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {gstAmount > 0 && (
                    <div className="flex justify-between">
                      <span>GST</span>
                      <span className="font-bold text-neutral-900 dark:text-white">₹{gstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {store.totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount</span>
                      <span>− ₹{store.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 block">Total Amount</span>
                    <span className="text-xl font-black text-neutral-900 dark:text-white">₹{grandTotal.toFixed(2)}</span>
                  </div>
                  {store.totalDiscount > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      ₹{store.totalDiscount.toFixed(2)} Saved
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={store.items.length === 0 || store.isLoading || isStoreClosed}
                  className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-extrabold text-sm rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{isStoreClosed ? "Store Closed" : isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}</span>
                  <ArrowRight size={16} />
                </button>

                {isStoreClosed && (
                  <p className="text-danger text-xs font-bold text-center">
                    This store is currently closed and not accepting orders.
                  </p>
                )}

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium pt-1">
                  <ShieldCheck size={14} className="text-primary" />
                  <span>100% Safe &amp; Secure Checkout</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      <Footer />
    </main>
  );
}
