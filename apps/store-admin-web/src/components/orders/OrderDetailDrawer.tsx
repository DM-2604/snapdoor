"use client";
// components/orders/OrderDetailDrawer.tsx
// Full-featured order detail drawer for store-admin — shows items, customer,
// payment, status history, and context-sensitive action buttons.

import React, { useState } from "react";
import {
  X,
  Phone,
  Package,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Loader2,
  User,
  MapPin,
  Hash,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeOwnerApi } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  productNameSnapshot: string;
  quantity: number;
  unitPriceSnapshot: number;
  lineTotal: number;
}

interface StatusHistory {
  id: string;
  fromStatus: string;
  toStatus: string;
  createdAt: string;
}

interface Payment {
  id: string;
  method: string;
  status: string;
  amount: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  fulfillmentType: string;
  channel: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  statusHistory: StatusHistory[];
  payments: Payment[];
  customer?: { name: string | null; phoneNumber?: string };
  customerContact?: { name: string; phone: string; deliveryAddress?: string };
}

interface Props {
  order: Order;
  onClose: () => void;
  onActionComplete: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PLACED:          { label: "Placed",       color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20",   icon: Clock },
  ACCEPTED:        { label: "Accepted",     color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/20",     icon: CheckCircle2 },
  PREPARING:       { label: "Preparing",    color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20",   icon: Package },
  READY_FOR_PICKUP:{ label: "Ready",        color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20",icon: CheckCircle2 },
  OUT_FOR_DELIVERY:{ label: "Dispatched",   color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/20",     icon: Truck },
  COMPLETED:       { label: "Completed",    color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20",icon: CheckCircle2 },
  CANCELLED:       { label: "Cancelled",    color: "text-red-600",     bg: "bg-red-50 dark:bg-red-900/20",       icon: XCircle },
  REJECTED:        { label: "Rejected",     color: "text-red-600",     bg: "bg-red-50 dark:bg-red-900/20",       icon: XCircle },
};

function fmt(dt: string) {
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "text-neutral-500", bg: "bg-neutral-100", icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ── Action Buttons ────────────────────────────────────────────────────────────

function ActionButtons({ order, onActionComplete }: { order: Order; onActionComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setLoading(true);
    try { await fn(); onActionComplete(); }
    finally { setLoading(false); }
  };

  const btnBase = "flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all disabled:opacity-50";
  const primaryBtn = `${btnBase} bg-emerald-600 text-white hover:bg-emerald-700`;
  const secondaryBtn = `${btnBase} bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700`;
  const dangerBtn = `${btnBase} bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100`;

  const { status, fulfillmentType } = order;
  const terminal = ["COMPLETED", "CANCELLED", "REJECTED"].includes(status);

  if (terminal) return null;

  return (
    <div className="space-y-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
      {loading && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-neutral-500">
          <Loader2 size={14} className="animate-spin" /> Processing…
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {status === "PLACED" && (
          <>
            <button disabled={loading} onClick={() => run(() => storeOwnerApi.acceptOrder(order.id))} className={primaryBtn}>
              ✅ Accept
            </button>
            <button disabled={loading} onClick={() => setShowReject(true)} className={dangerBtn}>
              ❌ Reject
            </button>
          </>
        )}
        {status === "ACCEPTED" && (
          <button disabled={loading} onClick={() => run(() => storeOwnerApi.prepareOrder(order.id))} className={primaryBtn}>
            🍳 Mark Preparing
          </button>
        )}
        {status === "PREPARING" && (
          <button disabled={loading} onClick={() => run(() => storeOwnerApi.markReady(order.id))} className={primaryBtn}>
            ✅ Mark Ready
          </button>
        )}
        {status === "READY_FOR_PICKUP" && fulfillmentType === "TAKEAWAY" && (
          <button disabled={loading} onClick={() => run(() => storeOwnerApi.completeOrder(order.id))} className={primaryBtn}>
            🎉 Complete (Collected)
          </button>
        )}
        {status === "READY_FOR_PICKUP" && fulfillmentType !== "TAKEAWAY" && (
          <button disabled={loading} onClick={() => run(() => storeOwnerApi.dispatchOrder(order.id))} className={secondaryBtn}>
            🚚 Dispatch
          </button>
        )}
        {status === "OUT_FOR_DELIVERY" && (
          <button disabled={loading} onClick={() => run(() => storeOwnerApi.completeOrder(order.id))} className={primaryBtn}>
            ✅ Mark Delivered
          </button>
        )}

        <button
          disabled={loading}
          onClick={() => run(() => storeOwnerApi.cancelOrder(order.id, "Cancelled by store"))}
          className={dangerBtn}
        >
          🚫 Cancel
        </button>
      </div>

      {showReject && (
        <div className="space-y-2 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
          <input
            placeholder="Rejection reason…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg outline-none focus:border-red-400"
          />
          <div className="flex gap-2">
            <button
              disabled={!rejectReason.trim() || loading}
              onClick={() => run(() => storeOwnerApi.rejectOrder(order.id, rejectReason))}
              className={dangerBtn}
            >
              Confirm Reject
            </button>
            <button onClick={() => setShowReject(false)} className={secondaryBtn}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────────

export function OrderDetailDrawer({ order, onClose, onActionComplete }: Props) {
  const queryClient = useQueryClient();

  const handleActionComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["store-orders"] });
    onActionComplete();
    onClose();
  };

  const contact = order.customerContact;
  const phone = contact?.phone ?? order.customer?.phoneNumber;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 flex flex-col shadow-2xl overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-neutral-500" />
              <span className="font-mono font-black text-emerald-500 text-sm">{order.orderNumber}</span>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-[11px] text-neutral-400">{fmt(order.createdAt)} · {order.channel} · {order.fulfillmentType}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Items */}
          <section>
            <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Package size={12} /> Items
            </h3>
            <div className="space-y-1.5">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm py-1.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                  <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate mr-2">{item.productNameSnapshot}</span>
                  <span className="text-neutral-500 shrink-0">×{item.quantity}</span>
                  <span className="font-bold text-neutral-900 dark:text-white shrink-0 ml-2">₹{Number(item.lineTotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1 text-sm">
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>−₹{Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base">
                <span>Total</span>
                <span>₹{Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Customer */}
          <section className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} /> Customer
            </h3>
            <p className="font-semibold text-sm text-neutral-900 dark:text-white">
              {contact?.name ?? order.customer?.name ?? "Guest"}
            </p>
            {phone && (
              <a href={`tel:${phone}`} className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                <Phone size={12} /> {phone}
              </a>
            )}
            {contact?.deliveryAddress && (
              <p className="text-xs text-neutral-500 flex items-start gap-1.5">
                <MapPin size={11} className="mt-0.5 shrink-0" /> {contact.deliveryAddress}
              </p>
            )}
          </section>

          {/* Payment */}
          {order.payments?.[0] && (
            <section>
              <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard size={12} /> Payment
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full font-bold text-xs">
                  {order.payments[0].method}
                </span>
                <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                  order.payments[0].status === "SUCCESS"
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                }`}>
                  {order.payments[0].status}
                </span>
                <span className="font-bold text-neutral-900 dark:text-white">₹{Number(order.payments[0].amount).toFixed(2)}</span>
              </div>
            </section>
          )}

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock size={12} /> History
              </h3>
              <ol className="relative border-l border-neutral-200 dark:border-neutral-700 ml-1 space-y-3">
                {order.statusHistory.map((entry) => (
                  <li key={entry.id} className="ml-4">
                    <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full -left-1.5 border-2 border-white dark:border-neutral-900" />
                    <div className="text-xs">
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">{entry.toStatus}</span>
                      <span className="text-neutral-400 ml-2">{fmt(entry.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 shrink-0">
          <ActionButtons order={order} onActionComplete={handleActionComplete} />
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.2s ease-out; }
      `}</style>
    </div>
  );
}
