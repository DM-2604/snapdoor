"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  ChevronRight,
  Headphones,
  RotateCcw,
  XCircle,
  Store,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { customerApi } from "@/lib/customer-api";

// Cancel windows in seconds per fulfillment type (mirrors backend config)
const CANCEL_WINDOW_SECONDS: Record<string, number> = {
  TAKEAWAY: 120,
  STORE_DELIVERY: 60,
  PLATFORM_DELIVERY: 60,
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getStatusBadge(status: string) {
  const map: Record<string, { cls: string; label: string }> = {
    COMPLETED: { cls: "bg-emerald-100 text-emerald-800", label: "Completed" },
    PENDING: { cls: "bg-amber-100 text-amber-800", label: "Pending" },
    ACCEPTED: { cls: "bg-blue-100 text-blue-800", label: "Accepted" },
    READY: { cls: "bg-cyan-100 text-cyan-800", label: "Ready for Pickup" },
    DISPATCHED: { cls: "bg-purple-100 text-purple-800", label: "Out for Delivery" },
    CANCELLED: { cls: "bg-red-100 text-red-800", label: "Cancelled" },
    REJECTED: { cls: "bg-red-100 text-red-800", label: "Rejected" },
  };
  const style = map[status] ?? { cls: "bg-neutral-100 text-neutral-800", label: status };
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${style.cls}`}>
      {style.label}
    </span>
  );
}

function TrackPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 space-y-6">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs animate-pulse space-y-4">
        <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xs animate-pulse space-y-6">
        <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ['customerOrder', params.id],
    queryFn: () => customerApi.getOrder(params.id),
    refetchInterval: 15_000, // poll every 15s for status updates
  });

  if (isLoading) return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />
      <TrackPageSkeleton />
      <Footer />
    </main>
  );

  if (isError || !order) return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center space-y-4 text-neutral-500 dark:text-neutral-400">
        <AlertCircle size={48} className="mx-auto opacity-40" />
        <p className="font-bold">Order not found or failed to load.</p>
        <Link href="/account/orders" className="text-primary font-bold hover:underline">← Back to Orders</Link>
      </div>
      <Footer />
    </main>
  );

  const secondsElapsed = (Date.now() - new Date(order.createdAt).getTime()) / 1000;
  const cancelWindow = CANCEL_WINDOW_SECONDS[order.fulfillmentType] ?? 120;
  const canCancel =
    secondsElapsed < cancelWindow &&
    !['COMPLETED', 'CANCELLED', 'REJECTED', 'DISPATCHED'].includes(order.status);
  const secondsLeft = Math.max(0, Math.round(cancelWindow - secondsElapsed));

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      await customerApi.cancelOrder(order.id, cancelReason || 'Customer requested cancellation');
      setShowCancelForm(false);
      refetch();
    } catch (err: unknown) {
      const anyErr = err as { message?: string };
      setCancelError(anyErr?.message ?? 'Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    try {
      await customerApi.reorder(order.id);
      router.push('/cart');
    } catch {
      // silently ignore — items may have been added partially
      router.push('/cart');
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <Link href="/account" className="hover:text-primary">My Account</Link>
        <ChevronRight size={12} />
        <Link href="/account/orders" className="hover:text-primary">My Orders</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-white font-bold">Order Tracking</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                Order #{order.orderNumber}
              </h2>
              {getStatusBadge(order.status)}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <span>Placed on {formatTime(order.createdAt)}</span>
              <span>•</span>
              <span className="font-bold text-neutral-700 dark:text-neutral-300">{order.store.name}</span>
            </div>
          </div>
          <Link
            href="/account/orders"
            className="flex items-center gap-1.5 px-4 py-2 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-xl font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-max text-xs"
          >
            ← All Orders
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">

            {/* Status Timeline */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xs space-y-6">
              <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">Order Timeline</h3>

              <div className="space-y-4">
                {order.statusHistory.map((entry, idx) => {
                  const isLatest = idx === order.statusHistory.length - 1;
                  return (
                    <div key={entry.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isLatest
                          ? 'bg-primary text-white ring-4 ring-emerald-100'
                          : 'bg-emerald-100 border-2 border-primary text-primary'
                      }`}>
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-extrabold text-xs ${isLatest ? 'text-primary' : 'text-neutral-900 dark:text-white'}`}>
                            {entry.status}
                          </span>
                          <span className="text-[10px] text-neutral-400">{formatTime(entry.createdAt)}</span>
                        </div>
                        {idx < order.statusHistory.length - 1 && (
                          <div className="w-px h-4 bg-emerald-200 ml-[15px] mt-2" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">Items Ordered</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-neutral-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🛍️</span>
                      <div>
                        <h5 className="font-bold text-neutral-800 dark:text-neutral-100">{item.productName}</h5>
                        <p className="text-[10px] text-neutral-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-neutral-900 dark:text-white">
                      ₹{(Number(item.priceAtTime) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {canCancel && (
              <div className="bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-800/50 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-neutral-900 dark:text-white text-sm">Cancel Order</h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      You can cancel within{' '}
                      <strong className="text-danger">{secondsLeft}s</strong>
                    </p>
                  </div>
                  {!showCancelForm && (
                    <button
                      onClick={() => setShowCancelForm(true)}
                      className="px-4 py-2 border border-red-300 dark:border-red-700 text-danger hover:bg-red-50 dark:hover:bg-red-900/20 font-bold rounded-xl text-xs transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>

                {showCancelForm && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Reason for cancellation (optional)"
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none focus:border-danger text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    />
                    {cancelError && (
                      <p className="text-[11px] text-danger font-medium">{cancelError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="px-4 py-2 bg-danger hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-60"
                      >
                        {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
                      </button>
                      <button
                        onClick={() => setShowCancelForm(false)}
                        className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl text-xs hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors"
                      >
                        Keep Order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {order.status === 'COMPLETED' && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-neutral-900 dark:text-white text-sm">Order Again?</h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Add the same items back to your cart</p>
                  </div>
                  <button
                    onClick={handleReorder}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    <RotateCcw size={14} />
                    <span>Reorder</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-4 space-y-6">

            {/* Order Summary */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs border-b border-neutral-100 dark:border-neutral-800 pb-3">
                Bill Details
              </h4>
              <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900 dark:text-white">₹{Number(order.total).toFixed(2)}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800/80 flex justify-between">
                <span className="font-bold text-neutral-800 dark:text-neutral-100 text-xs">Total Paid</span>
                <span className="font-black text-neutral-900 dark:text-white text-sm">₹{Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Store Info */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs border-b border-neutral-100 dark:border-neutral-800 pb-2">
                Store
              </h4>
              <div className="flex items-center gap-3 text-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-xl shrink-0">
                  <Store size={20} className="text-primary" />
                </div>
                <div>
                  <h5 className="font-bold text-neutral-800 dark:text-neutral-100">{order.store.name}</h5>
                  <p className="text-[10px] text-neutral-400">{order.fulfillmentType.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            {order.payments[0] && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-3">
                <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  Payment
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-primary" />
                    <span className="font-bold text-neutral-800 dark:text-neutral-100">{order.payments[0].method}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    order.payments[0].status === 'SUCCESS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.payments[0].status === 'INITIATED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-neutral-100 text-neutral-800'
                  }`}>
                    {order.payments[0].status}
                  </span>
                </div>
              </div>
            )}

            {/* Help */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs">
              <button className="flex items-center gap-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-primary transition-colors">
                <Headphones size={16} className="text-primary" />
                <span>Need Help?</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      <Footer />
    </main>
  );
}
