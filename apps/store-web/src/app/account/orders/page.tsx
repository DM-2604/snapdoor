"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import {
  Search,
  Filter,
  CheckCircle2,
  Truck,
  FileText,
  MapPin,
  Headphones,
  ChevronRight,
  Copy,
  Wallet,
  RotateCcw,
  Package,
  XCircle,
  Clock,
} from "lucide-react";
import { customerApi, OrderSummary } from "@/lib/customer-api";

const STATUS_TABS = [
  { id: undefined, label: "All Orders" },
  { id: "COMPLETED", label: "Completed" },
  { id: "PENDING", label: "Pending" },
  { id: "ACCEPTED", label: "Processing" },
  { id: "CANCELLED", label: "Cancelled" },
];

function getStatusBadge(status: string) {
  const map: Record<string, { cls: string; label: string }> = {
    COMPLETED: { cls: "bg-emerald-100 text-emerald-800", label: "Completed" },
    PENDING: { cls: "bg-amber-100 text-amber-800", label: "Pending" },
    ACCEPTED: { cls: "bg-blue-100 text-blue-800", label: "Accepted" },
    READY: { cls: "bg-cyan-100 text-cyan-800", label: "Ready" },
    DISPATCHED: { cls: "bg-purple-100 text-purple-800", label: "Dispatched" },
    CANCELLED: { cls: "bg-red-100 text-red-800", label: "Cancelled" },
    REJECTED: { cls: "bg-red-100 text-red-800", label: "Rejected" },
  };
  const style = map[status] ?? { cls: "bg-neutral-100 text-neutral-800", label: status };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${style.cls}`}>
      {style.label}
    </span>
  );
}

function OrderListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div key={n} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-2 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
            <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
          </div>
          <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["customerOrders", activeStatus],
    queryFn: () => customerApi.listOrders({ status: activeStatus, limit: 20 }),
  });

  const orders: OrderSummary[] = (data?.orders ?? []).filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.store.name.toLowerCase().includes(q)
    );
  });

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
        <span className="text-neutral-900 dark:text-white font-bold">My Orders</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Account Sidebar */}
          <AccountSidebar activeTab="orders" />

          {/* Main Orders Content */}
          <div className="flex-1 space-y-6">

            {/* Header with Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">My Orders</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Track, manage and reorder your items</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by order ID or store..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none focus:border-primary w-52 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                  <Search size={14} className="absolute left-2.5 top-2 text-neutral-400" />
                </div>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar border-b border-neutral-200 dark:border-neutral-800 font-bold text-xs">
              {STATUS_TABS.map((tab) => (
                <button
                  key={String(tab.id)}
                  onClick={() => setActiveStatus(tab.id)}
                  className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
                    activeStatus === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Order Cards */}
            {isLoading ? (
              <OrderListSkeleton />
            ) : isError ? (
              <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                <p className="font-bold">Failed to load orders. Please try again.</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3 text-neutral-400">
                <Package size={48} className="opacity-40" />
                <p className="font-bold text-neutral-600 dark:text-neutral-400 text-sm">No orders found</p>
                <Link href="/shops" className="px-5 py-2 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark transition-colors">
                  Browse Stores
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow space-y-4 cursor-pointer"
                    onClick={() => router.push(`/account/orders/${order.id}`)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-xl shrink-0">
                          📦
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-neutral-900 dark:text-white text-xs">
                              #{order.orderNumber}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(order.orderNumber);
                              }}
                              className="text-neutral-400 hover:text-primary"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                          <p className="text-[11px] text-neutral-400">
                            {new Date(order.createdAt).toLocaleString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                          <h4 className="font-bold text-xs text-neutral-800 dark:text-neutral-100 flex items-center gap-1 mt-0.5">
                            <span>{order.store.name}</span>
                            <CheckCircle2 size={12} className="text-primary fill-primary" />
                          </h4>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-start sm:items-end justify-between gap-1">
                        <div>
                          <span className="font-black text-sm text-neutral-900 dark:text-white">₹{Number(order.total).toFixed(2)}</span>
                          {order.payments[0] && (
                            <span className="text-[10px] text-neutral-400 block">{order.payments[0].method}</span>
                          )}
                        </div>
                        <div>{getStatusBadge(order.status)}</div>
                      </div>
                    </div>

                    {/* Items preview */}
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {order.items.slice(0, 3).map((i) => i.productName).join(', ')}
                      {order.items.length > 3 ? ` +${order.items.length - 3} more` : ''}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div />
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => router.push(`/account/orders/${order.id}`)}
                          className="px-4 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:border-primary text-neutral-800 dark:text-neutral-100 font-bold rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors"
                        >
                          View Details
                        </button>
                        {order.status === 'COMPLETED' && (
                          <button className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors">
                            Reorder
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Right Panel */}
          <div className="w-full md:w-72 space-y-6 shrink-0">

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">Order Stats</h4>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Total Orders</span>
                  <span className="font-extrabold text-neutral-900 dark:text-white">{data?.total ?? '—'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">Quick Actions</h4>
              <div className="space-y-2 text-xs">
                <Link href="/account/addresses" className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors font-bold text-neutral-700 dark:text-neutral-300">
                  <MapPin size={16} className="text-primary" />
                  <span>Manage Addresses</span>
                </Link>
                <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <Headphones size={16} className="text-primary" />
                  <span>Customer Support</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
