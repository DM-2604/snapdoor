'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Star,
  ChevronRight,
} from 'lucide-react';
import { storeOwnerApi } from '@/lib/api';

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  DELIVERED: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  COMPLETED: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  OUT_FOR_DELIVERY: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Truck },
  READY_FOR_PICKUP: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Truck },
  PREPARING: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
  ACCEPTED: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
  PLACED: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
  CANCELLED: { color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
  REJECTED: { color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
};

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400',
  blue: 'bg-blue-500/10 text-blue-400',
  amber: 'bg-amber-500/10 text-amber-400',
  purple: 'bg-purple-500/10 text-purple-400',
};

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('');

  const { data: profileData } = useQuery({
    queryKey: ['store-profile'],
    queryFn: () => storeOwnerApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch recent products
  const { data: productsData } = useQuery({
    queryKey: ['store-products', 'recent'],
    queryFn: () => storeOwnerApi.listProducts({ limit: 5 }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch recent orders
  const { data: ordersData } = useQuery({
    queryKey: ['store-orders', 'recent'],
    queryFn: () => storeOwnerApi.listOrders({ limit: 5 }),
    staleTime: 5 * 60 * 1000,
  });

  const storeName = profileData?.name ?? 'Your Store';
  const recentOrders = ordersData?.items ?? [];
  const topProducts = productsData?.items ?? [];

  // TODO: Wire to GET /store/analytics when backend endpoint is available
  const stats = [
    { label: 'Total Revenue', value: '—', change: '—', up: true, icon: TrendingUp, color: 'emerald' },
    { label: 'Total Orders', value: '—', change: '—', up: true, icon: ShoppingBag, color: 'blue' },
    { label: 'Active Products', value: '—', change: '—', up: true, icon: Package, color: 'amber' },
    { label: 'Active Customers', value: '—', change: '—', up: true, icon: Users, color: 'purple' },
  ];

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good Morning');
    else if (h < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white transition-colors">
            {greeting ? `${greeting}, ` : ''}{storeName} 👋
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 transition-colors">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-600/30 dark:shadow-emerald-900/40"
        >
          + Add Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-emerald-500/30 dark:hover:border-neutral-700 transition-all shadow-sm group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${colorMap[stat.color]}`}>
                  <Icon size={20} />
                </div>
                <span
                  className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${
                    stat.up
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                  }`}
                >
                  {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{stat.value}</p>
              <p className="text-xs text-neutral-500 mt-1 font-semibold">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Recent Orders</h2>
            <Link href="/orders" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto min-h-[250px]">
            {recentOrders.length === 0 ? (
              <div className="p-10 text-center text-neutral-500">
                <p>No orders yet.</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                    <th className="text-left px-6 py-3 font-bold text-neutral-500 uppercase tracking-wider text-[10px]">Order ID</th>
                    <th className="text-left px-4 py-3 font-bold text-neutral-500 uppercase tracking-wider text-[10px]">Customer</th>
                    <th className="text-left px-4 py-3 font-bold text-neutral-500 uppercase tracking-wider text-[10px] hidden sm:table-cell">Items</th>
                    <th className="text-left px-4 py-3 font-bold text-neutral-500 uppercase tracking-wider text-[10px]">Total</th>
                    <th className="text-left px-4 py-3 font-bold text-neutral-500 uppercase tracking-wider text-[10px]">Status</th>
                    <th className="text-left px-4 py-3 font-bold text-neutral-500 uppercase tracking-wider text-[10px] hidden md:table-cell">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any, idx: number) => {
                    const cfg = statusConfig[order.status] ?? { color: "text-neutral-400", bg: "bg-neutral-500/10", icon: Clock };
                    const StatusIcon = cfg.icon;
                    return (
                      <tr key={idx} className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{(order.orderNumber || order.id).slice(0, 8)}...</td>
                        <td className="px-4 py-4 font-bold text-neutral-900 dark:text-white">{order.customer?.name ?? "Guest"}</td>
                        <td className="px-4 py-4 font-medium text-neutral-500 hidden sm:table-cell">{order.items?.length ?? 0} items</td>
                        <td className="px-4 py-4 font-bold text-neutral-900 dark:text-white">₹{order.totalAmount}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold ${cfg.bg} ${cfg.color}`}>
                            <StatusIcon size={12} />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-medium text-neutral-500 hidden md:table-cell">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Top Products</h2>
            <Link href="/products" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
              Manage <ChevronRight size={12} />
            </Link>
          </div>
          <div className="p-5 space-y-4">
            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-neutral-500">
                <p>No products yet.</p>
              </div>
            ) : (
              topProducts.map((p: any, idx: number) => {
                const emoji = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "📦";
                return (
                  <div key={idx} className="flex items-center gap-4 p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700">
                    <div className="w-10 h-10 bg-white dark:bg-neutral-800 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm border border-neutral-100 dark:border-neutral-700">
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-xs font-medium text-neutral-500 mt-0.5">₹{p.basePrice ?? 'N/A'}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Add New Product', href: '/products', emoji: '📦', desc: 'List a new item' },
          { label: 'View All Orders', href: '/orders', emoji: '🛍️', desc: 'Manage orders' },
          { label: 'Check Analytics', href: '/analytics', emoji: '📊', desc: 'View insights' },
          { label: 'Store Settings', href: '/settings', emoji: '⚙️', desc: 'Configure store' },
        ].map((action, idx) => (
          <Link
            key={idx}
            href={action.href}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-800 rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-1 group"
          >
            <div className="w-10 h-10 bg-neutral-50 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-xl shadow-sm border border-neutral-100 dark:border-neutral-700 transition-transform group-hover:scale-110">
              {action.emoji}
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{action.label}</p>
              <p className="text-xs font-medium text-neutral-500 mt-1">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
