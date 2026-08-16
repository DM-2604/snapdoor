"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  RefreshCw,
  ChefHat,
  PackageCheck,
  ThumbsUp,
  ThumbsDown,
  PartyPopper,
  Ban,
} from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { storeOwnerApi } from "@/lib/api";
import { OrderDetailDrawer } from "@/components/orders/OrderDetailDrawer";
import toast from "react-hot-toast";

// ── SSE hook ─────────────────────────────────────────────────────────────────

function useOrderSSE(onNewOrder: (event: any) => void) {
  const esRef = useRef<EventSource | null>(null);
  const callbackRef = useRef(onNewOrder);
  callbackRef.current = onNewOrder;

  useEffect(() => {
    const url = storeOwnerApi.getOrderStreamUrl();
    let es: EventSource;
    try {
      es = new EventSource(url, { withCredentials: true });
      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          callbackRef.current(event);
        } catch {}
      };
      es.onerror = () => es.close();
      esRef.current = es;
    } catch {
      // SSE not supported — polling fallback handles it
    }
    return () => esRef.current?.close();
  }, []);
}

const ITEMS_PER_PAGE = 8;

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  DELIVERED:        { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  COMPLETED:        { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  OUT_FOR_DELIVERY: { color: "text-blue-400",    bg: "bg-blue-500/10",    icon: Truck },
  READY_FOR_PICKUP: { color: "text-blue-400",    bg: "bg-blue-500/10",    icon: Truck },
  PREPARING:        { color: "text-amber-400",   bg: "bg-amber-500/10",   icon: ChefHat },
  ACCEPTED:         { color: "text-amber-400",   bg: "bg-amber-500/10",   icon: Clock },
  PLACED:           { color: "text-orange-400",  bg: "bg-orange-500/10",  icon: Clock },
  CANCELLED:        { color: "text-red-400",     bg: "bg-red-500/10",     icon: XCircle },
  REJECTED:         { color: "text-red-400",     bg: "bg-red-500/10",     icon: XCircle },
};

const UI_TABS = ["All", "Pending", "Preparing", "Ready", "Completed"];

function mapTabToBackendStatus(tab: string): string | undefined {
  switch (tab) {
    case "Pending":   return "PLACED";
    case "Preparing": return "PREPARING";
    case "Ready":     return "READY_FOR_PICKUP";
    case "Completed": return "COMPLETED";
    default:          return undefined;
  }
}

// ── Inline action button row ──────────────────────────────────────────────────

function InlineActions({
  order,
  onDone,
}: {
  order: any;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<any>) => {
    setBusy(key);
    try {
      await fn();
      toast.success("Order updated");
      onDone();
    } catch {
      toast.error("Action failed — please try again");
    } finally {
      setBusy(null);
    }
  };

  const { status, fulfillmentType, id } = order;
  const terminal = ["COMPLETED", "CANCELLED", "REJECTED"].includes(status);
  if (terminal) return <span className="text-[10px] text-neutral-400">—</span>;

  const btn = (key: string, label: React.ReactNode, style: string, fn: () => Promise<any>) => (
    <button
      key={key}
      disabled={!!busy}
      onClick={(e) => { e.stopPropagation(); run(key, fn); }}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 ${style}`}
    >
      {busy === key ? <RefreshCw size={10} className="animate-spin" /> : null}
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {status === "PLACED" && (
        <>
          {btn("accept", <><ThumbsUp size={10} /><span>Accept</span></>, "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50",
            () => storeOwnerApi.acceptOrder(id))}
          {btn("reject", <><ThumbsDown size={10} /><span>Reject</span></>, "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100",
            () => {
              const reason = prompt("Rejection reason (required):");
              if (!reason?.trim()) return Promise.reject("no reason");
              return storeOwnerApi.rejectOrder(id, reason);
            })}
        </>
      )}
      {status === "ACCEPTED" &&
        btn("prepare", <><ChefHat size={10} /><span>Preparing</span></>, "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200",
          () => storeOwnerApi.prepareOrder(id))}
      {status === "PREPARING" &&
        btn("ready", <><PackageCheck size={10} /><span>Ready</span></>, "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200",
          () => storeOwnerApi.markReady(id))}
      {status === "READY_FOR_PICKUP" && fulfillmentType === "TAKEAWAY" &&
        btn("complete", <><CheckCircle2 size={10} /><span>Complete</span></>, "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200",
          () => storeOwnerApi.completeOrder(id))}
      {status === "READY_FOR_PICKUP" && fulfillmentType !== "TAKEAWAY" &&
        btn("dispatch", <><Truck size={10} /><span>Dispatch</span></>, "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200",
          () => storeOwnerApi.dispatchOrder(id))}
      {status === "OUT_FOR_DELIVERY" &&
        btn("deliver", <><CheckCircle2 size={10} /><span>Delivered</span></>, "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200",
          () => storeOwnerApi.completeOrder(id))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const notificationAudio = useRef<HTMLAudioElement | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["store-orders"] });

  // ── SSE: real-time new order push ─────────────────────────────────────────
  useOrderSSE((event) => {
    invalidate();
    notificationAudio.current?.play().catch(() => {});
    toast.success(`🛒 New order #${event.orderNumber ?? ""} — ₹${event.totalAmount ?? ""}`);
  });

  // 30s fallback polling
  const { data, isLoading } = useQuery({
    queryKey: ["store-orders", currentPage, statusFilter, search],
    queryFn: () =>
      storeOwnerApi.listOrders({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: mapTabToBackendStatus(statusFilter),
      }),
    placeholderData: (prev) => prev,
    refetchInterval: 30_000,
  });

  const orders = data?.items ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  // Count pending for badge
  const { data: pendingData } = useQuery({
    queryKey: ["store-orders-pending-count"],
    queryFn: () => storeOwnerApi.listOrders({ status: "PLACED", limit: 1 }),
    refetchInterval: 15_000,
  });
  const pendingCount = pendingData?.total ?? 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Orders</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Track and manage all customer orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
              <span className="text-xs font-bold text-orange-700 dark:text-orange-300">
                {pendingCount} pending
              </span>
            </div>
          )}
          <button
            onClick={invalidate}
            className="p-2 text-neutral-500 hover:text-emerald-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {UI_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === tab
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400"
            }`}
          >
            {tab}
            {tab === "Pending" && pendingCount > 0 && (
              <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-black rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        {/* Search */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by order ID (Press Enter)…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-emerald-600"
            />
          </form>
          <span className="text-xs text-neutral-500">{totalItems} orders</span>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full py-20">
              <RefreshCw className="animate-spin text-emerald-500" size={24} />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center h-full py-20 text-neutral-500">
              No orders found.
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500">Order ID</th>
                  <th className="text-left px-3 py-3 font-semibold text-neutral-500">Customer</th>
                  <th className="text-left px-3 py-3 font-semibold text-neutral-500 hidden md:table-cell">Items</th>
                  <th className="text-left px-3 py-3 font-semibold text-neutral-500">Total</th>
                  <th className="text-left px-3 py-3 font-semibold text-neutral-500">Status</th>
                  <th className="text-left px-3 py-3 font-semibold text-neutral-500 hidden sm:table-cell">Time</th>
                  <th className="text-left px-3 py-3 font-semibold text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => {
                  const cfg = statusConfig[order.status] ?? { color: "text-neutral-400", bg: "bg-neutral-500/10", icon: Clock };
                  const StatusIcon = cfg.icon;
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-neutral-200 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="px-5 py-3 font-mono font-bold text-emerald-500">
                        {(order.orderNumber || order.id).slice(0, 8)}…
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-bold text-neutral-900 dark:text-white">{order.customer?.name ?? "Guest"}</p>
                        <p className="text-neutral-500 text-[10px]">{order.items?.length ?? 0} items</p>
                      </td>
                      <td className="px-3 py-3 text-neutral-500 dark:text-neutral-400 hidden md:table-cell max-w-[140px] truncate">
                        {order.items?.map((i: any) => i.productNameSnapshot).join(", ") || "—"}
                      </td>
                      <td className="px-3 py-3 font-bold text-neutral-900 dark:text-white">
                        ₹{order.totalAmount}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon size={10} />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-neutral-500 hidden sm:table-cell">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Inline state-machine actions */}
                          <InlineActions order={order} onDone={invalidate} />
                          {/* Detail drawer */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            title="View details"
                            className="p-1.5 text-neutral-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-neutral-200 dark:border-neutral-800">
          <span className="text-xs text-neutral-500">
            Showing {totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="w-8 h-8 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = totalPages <= 5 ? i + 1 : Math.max(1, currentPage - 2) + i;
              if (page > totalPages) return null;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${
                    page === currentPage
                      ? "bg-emerald-600 text-white"
                      : "border border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="w-8 h-8 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onActionComplete={() => {
            invalidate();
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Preload notification audio */}
      <audio ref={notificationAudio} src="/sounds/new-order.mp3" preload="auto" className="hidden" />
    </div>
  );
}
