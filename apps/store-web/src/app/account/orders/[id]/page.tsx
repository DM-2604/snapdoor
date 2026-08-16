"use client";

import React from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import {
  CheckCircle2,
  ChevronRight,
  Package,
  Clock,
  MapPin,
  Phone,
  Store,
  RotateCcw,
  XCircle,
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  CreditCard,
  Receipt,
} from "lucide-react";
import { customerApi, OrderDetail } from "@/lib/customer-api";
import { useState } from "react";

// ── Status helpers ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; bg: string; text: string; border: string }
> = {
  PLACED: {
    label: "Order Placed",
    icon: <Clock size={20} />,
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: <CheckCircle2 size={20} />,
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  PREPARING: {
    label: "Being Prepared",
    icon: <Package size={20} />,
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
  },
  READY_FOR_PICKUP: {
    label: "Ready for Pickup",
    icon: <CheckCircle2 size={20} />,
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    text: "text-cyan-700 dark:text-cyan-400",
    border: "border-cyan-200 dark:border-cyan-800",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    icon: <MapPin size={20} />,
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  COMPLETED: {
    label: "Delivered",
    icon: <CheckCircle2 size={20} />,
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <XCircle size={20} />,
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
  REJECTED: {
    label: "Rejected",
    icon: <XCircle size={20} />,
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
};

const PROGRESS_STEPS = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
];

function getProgressIndex(status: string) {
  return PROGRESS_STEPS.indexOf(status);
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function OrderDetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
      <div className="h-48 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
      <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = params.id;
  const isJustConfirmed = searchParams.get("confirmed") === "true";
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { data: order, isLoading, isError } = useQuery<OrderDetail>({
    queryKey: ["order", orderId],
    queryFn: () => customerApi.getOrder(orderId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Poll every 15s while order is active
      if (!status || ["COMPLETED", "CANCELLED", "REJECTED"].includes(status)) return false;
      return 15_000;
    },
  });

  const handleCopyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = async () => {
    if (!order) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      await customerApi.cancelOrder(orderId, "Customer requested cancellation");
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Failed to cancel order";
      alert(msg);
    } finally {
      setCancelling(false);
    }
  };

  const cfg = order ? (STATUS_CONFIG[order.status] ?? STATUS_CONFIG["PLACED"]) : null;
  const progressIdx = order ? getProgressIndex(order.status) : -1;
  const canCancel =
    order &&
    ["PLACED", "ACCEPTED"].includes(order.status) &&
    (Date.now() - new Date(order.createdAt).getTime()) < 5 * 60 * 1000; // 5 min window

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
        <span className="text-neutral-900 dark:text-white font-bold truncate max-w-[120px]">
          {order ? `#${order.orderNumber}` : "Order Detail"}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Account Sidebar */}
          <AccountSidebar activeTab="orders" />

          {/* Main Content */}
          <div className="flex-1 space-y-4">

            {/* ── Order Confirmed Banner ── */}
            {isJustConfirmed && !isLoading && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h2 className="font-extrabold text-emerald-800 dark:text-emerald-300 text-sm">
                    🎉 Order placed successfully!
                  </h2>
                  <p className="text-emerald-700 dark:text-emerald-400 text-xs mt-1">
                    Your order has been received and is being processed by the store.
                  </p>
                </div>
              </div>
            )}

            {/* ── Loading / Error states ── */}
            {isLoading ? (
              <OrderDetailSkeleton />
            ) : isError || !order ? (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 text-center space-y-4">
                <p className="text-4xl">😕</p>
                <p className="font-bold text-neutral-800 dark:text-neutral-200">Could not load order</p>
                <Link href="/account/orders" className="inline-flex items-center gap-2 text-primary font-bold text-xs hover:underline">
                  <ArrowLeft size={14} /> Back to Orders
                </Link>
              </div>
            ) : (
              <>
                {/* ── Status Card ── */}
                <div className={`border rounded-2xl p-5 ${cfg!.bg} ${cfg!.border} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${cfg!.text}`}>{cfg!.icon}</div>
                      <div>
                        <p className={`font-extrabold text-sm ${cfg!.text}`}>{cfg!.label}</p>
                        <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                          {new Date(order.createdAt).toLocaleString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCopyOrderNumber}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-neutral-900/60 border border-neutral-300 dark:border-neutral-700 rounded-xl font-bold text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-900 transition-colors"
                    >
                      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      #{order.orderNumber}
                    </button>
                  </div>

                  {/* Progress bar (only for active orders) */}
                  {progressIdx >= 0 && !["CANCELLED", "REJECTED"].includes(order.status) && (
                    <div className="mt-2">
                      <div className="flex items-center gap-0">
                        {PROGRESS_STEPS.map((step, i) => (
                          <React.Fragment key={step}>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black border-2 shrink-0 transition-all ${
                                i <= progressIdx
                                  ? "bg-primary border-primary text-white"
                                  : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-400"
                              }`}
                            >
                              {i < progressIdx ? <Check size={10} /> : i + 1}
                            </div>
                            {i < PROGRESS_STEPS.length - 1 && (
                              <div
                                className={`flex-1 h-0.5 transition-all ${
                                  i < progressIdx ? "bg-primary" : "bg-neutral-200 dark:bg-neutral-700"
                                }`}
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        {["Placed", "Accepted", "Preparing", "Ready", "On Way", "Done"].map((lbl, i) => (
                          <span
                            key={lbl}
                            className={`text-[9px] font-bold ${i <= progressIdx ? "text-primary" : "text-neutral-400"}`}
                            style={{ width: "16.6%", textAlign: i === 0 ? "left" : i === 5 ? "right" : "center" }}
                          >
                            {lbl}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Items ── */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    <Package size={15} className="text-primary" />
                    <h3 className="font-extrabold text-neutral-900 dark:text-white text-xs">
                      Items Ordered
                    </h3>
                    <span className="ml-auto text-neutral-400 text-[11px]">{order.store.name}</span>
                  </div>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3">
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-black text-neutral-600 dark:text-neutral-400 shrink-0">
                          {item.quantity}×
                        </div>
                        <span className="flex-1 font-semibold text-neutral-800 dark:text-neutral-100 text-xs">
                          {item.productName}
                        </span>
                        <span className="font-extrabold text-neutral-900 dark:text-white text-xs">
                          ₹{(item.priceAtTime * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price breakdown */}
                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-1.5">
                    <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                      <span>Subtotal</span>
                      <span>₹{Number(order.total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-neutral-900 dark:text-white text-xs border-t border-neutral-100 dark:border-neutral-800 pt-1.5 mt-1.5">
                      <span>Total Paid</span>
                      <span className="text-primary">₹{Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* ── Store + Payment info ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                      <Store size={14} className="text-primary" />
                      <h3 className="font-extrabold text-neutral-900 dark:text-white text-xs">Store</h3>
                    </div>
                    <p className="font-bold text-neutral-800 dark:text-neutral-100 text-xs">{order.store.name}</p>
                    <p className="text-neutral-400 text-[11px]">{order.fulfillmentType.replace(/_/g, " ")}</p>
                  </div>

                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                      <CreditCard size={14} className="text-primary" />
                      <h3 className="font-extrabold text-neutral-900 dark:text-white text-xs">Payment</h3>
                    </div>
                    {order.payments.map((p) => (
                      <div key={p.id} className="space-y-1">
                        <p className="font-bold text-neutral-800 dark:text-neutral-100 text-xs">{p.method}</p>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            p.status === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : p.status === "INITIATED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Timeline ── */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                      <Receipt size={14} className="text-primary" />
                      <h3 className="font-extrabold text-neutral-900 dark:text-white text-xs">Order Timeline</h3>
                    </div>
                    <ol className="relative border-l border-neutral-200 dark:border-neutral-700 ml-2 space-y-4">
                      {[...order.statusHistory].reverse().map((h, i) => (
                        <li key={h.id} className="ml-4">
                          <div
                            className={`absolute -left-1.5 w-3 h-3 rounded-full border-2 ${
                              i === 0
                                ? "border-primary bg-primary"
                                : "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900"
                            }`}
                          />
                          <div>
                            <p className="font-extrabold text-neutral-800 dark:text-neutral-100 text-xs">
                              {STATUS_CONFIG[h.status]?.label ?? h.status}
                            </p>
                            <p className="text-neutral-400 text-[11px]">
                              {new Date(h.createdAt).toLocaleString("en-IN", {
                                day: "numeric", month: "short",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* ── Actions ── */}
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/account/orders"
                    className="flex items-center gap-2 px-5 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    <ArrowLeft size={14} /> All Orders
                  </Link>

                  {order.status === "COMPLETED" && (
                    <button
                      onClick={async () => {
                        try {
                          const res = await customerApi.reorder(orderId);
                          router.push(`/store/${res.storeId}`);
                        } catch { alert("Could not reorder. Please try again."); }
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors"
                    >
                      <RotateCcw size={14} /> Reorder
                    </button>
                  )}

                  {canCancel && (
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex items-center gap-2 px-5 py-2.5 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-60"
                    >
                      {cancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                      Cancel Order
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Panel */}
          <div className="w-full md:w-64 shrink-0 space-y-4">
            {order && (
              <>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-3">
                  <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    Order Summary
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Order ID</span>
                      <span className="font-bold text-neutral-900 dark:text-white">#{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Items</span>
                      <span className="font-bold text-neutral-900 dark:text-white">{order.items.length}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Total</span>
                      <span className="font-bold text-primary">₹{Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 space-y-2">
                  <p className="font-extrabold text-primary text-xs">Need Help?</p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                    For any issues with your order, contact our support team.
                  </p>
                  <button className="w-full mt-1 flex items-center justify-center gap-2 px-4 py-2 border border-primary/30 text-primary font-bold rounded-xl text-xs hover:bg-primary/10 transition-colors">
                    <Phone size={12} /> Contact Support
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
