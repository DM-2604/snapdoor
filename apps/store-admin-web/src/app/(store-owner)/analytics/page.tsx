'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, TrendingDown, Users, ShoppingBag,
  Package, RefreshCw, AlertCircle, BarChart2,
} from 'lucide-react';
import { storeOwnerApi } from '@/lib/api';

type Period = '7d' | '30d' | '90d';

const PERIOD_LABELS: Record<Period, string> = {
  '7d': '7 Days',
  '30d': '30 Days',
  '90d': '90 Days',
};

const CATEGORY_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-teal-500',
];

function fmt(n: number) {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-xl ${className}`} />;
}

// ── KPI Skeleton ─────────────────────────────────────────────────────────────
function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

// ── Chart Skeleton ───────────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="flex items-end gap-3 h-40">
        {[60, 80, 45, 90, 70, 100, 75].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-t-lg" style={{ height: `${h}%`, maxHeight: '120px' }} />
            <Skeleton className="h-2 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('7d');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['store-analytics', period],
    queryFn: () => storeOwnerApi.getAnalytics(period),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const kpis = data?.kpis;
  const revenueByDay = data?.revenueByDay ?? [];
  const salesByCategory = data?.salesByCategory ?? [];
  const topCustomers = data?.topCustomers ?? [];
  const maxRevenue = Math.max(...revenueByDay.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Performance insights — completed orders only
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                period === p
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">Could not load analytics.</p>
          <button onClick={() => refetch()} className="ml-auto text-xs font-bold text-red-500 hover:underline">Retry</button>
        </div>
      )}

      {/* KPI Row */}
      {isLoading ? <KpiSkeleton /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Orders',
              value: kpis?.totalOrders ?? 0,
              display: String(kpis?.totalOrders ?? '—'),
              icon: ShoppingBag,
              color: 'text-blue-400 bg-blue-500/10',
            },
            {
              label: 'Total Revenue',
              value: kpis?.totalRevenue ?? 0,
              display: fmt(kpis?.totalRevenue ?? 0),
              icon: TrendingUp,
              color: 'text-emerald-400 bg-emerald-500/10',
            },
            {
              label: 'Avg Order Value',
              value: kpis?.avgOrderValue ?? 0,
              display: fmt(kpis?.avgOrderValue ?? 0),
              icon: BarChart2,
              color: 'text-amber-400 bg-amber-500/10',
            },
            {
              label: 'Active Products',
              value: kpis?.activeProducts ?? 0,
              display: String(kpis?.activeProducts ?? '—'),
              icon: Package,
              color: 'text-purple-400 bg-purple-500/10',
            },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
                  <Icon size={18} />
                </div>
                <p className="text-xs text-neutral-500 font-medium">{kpi.label}</p>
                <p className="text-2xl font-black text-neutral-900 dark:text-white mt-0.5">{kpi.display}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Last {PERIOD_LABELS[period].toLowerCase()}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Bar Chart */}
        {isLoading ? <div className="lg:col-span-2"><ChartSkeleton /></div> : (
          <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-neutral-900 dark:text-white">Revenue</h2>
              <span className="text-xs text-neutral-500">Last {PERIOD_LABELS[period].toLowerCase()}</span>
            </div>

            {revenueByDay.every((d) => d.revenue === 0) ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <BarChart2 size={32} className="text-neutral-300 dark:text-neutral-700" />
                <p className="text-sm text-neutral-400">No completed orders in this period</p>
              </div>
            ) : (
              <>
                <div className={`flex items-end gap-1 h-40 overflow-x-auto pb-1 ${revenueByDay.length > 14 ? 'gap-0.5' : 'gap-2'}`}>
                  {revenueByDay.map((day, i) => {
                    const heightPct = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                    const isMax = day.revenue === maxRevenue && day.revenue > 0;
                    return (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0 group relative">
                        {day.revenue > 0 && (
                          <span className="absolute -top-6 text-[9px] text-neutral-400 whitespace-nowrap hidden group-hover:block bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 rounded z-10">
                            {fmt(day.revenue)}
                          </span>
                        )}
                        <div className="w-full flex flex-col justify-end" style={{ height: '120px' }}>
                          <div
                            className={`w-full rounded-t-md transition-all ${isMax ? 'bg-emerald-500' : day.revenue > 0 ? 'bg-emerald-500/40' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                            style={{ height: `${Math.max(heightPct, day.revenue > 0 ? 4 : 2)}%` }}
                          />
                        </div>
                        {revenueByDay.length <= 30 && (
                          <span className="text-[9px] text-neutral-400 font-medium truncate w-full text-center">
                            {day.date}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {revenueByDay.length > 30 && (
                  <p className="text-xs text-neutral-400 text-center mt-2">
                    {revenueByDay[0]?.date} — {revenueByDay[revenueByDay.length - 1]?.date}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Sales by Category */}
        {isLoading ? <ChartSkeleton /> : (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
            <h2 className="font-bold text-neutral-900 dark:text-white mb-6">Sales by Category</h2>
            {salesByCategory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <Package size={28} className="text-neutral-300 dark:text-neutral-700" />
                <p className="text-xs text-neutral-400">No data for this period</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {salesByCategory.map((cat, i) => (
                    <div key={cat.categoryId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300 truncate max-w-[120px]" title={cat.categoryName}>
                          {cat.categoryName}
                        </span>
                        <span className="font-bold text-neutral-900 dark:text-white ml-2 shrink-0">
                          {cat.revenueShare}%
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} transition-all duration-500`}
                          style={{ width: `${cat.revenueShare}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-400">{fmt(cat.totalRevenue)}</p>
                    </div>
                  ))}
                </div>
                {/* Legend */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {salesByCategory.map((cat, i) => (
                    <div key={cat.categoryId} className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`} />
                      {cat.categoryName}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Top Customers */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="font-bold text-neutral-900 dark:text-white">Top Customers</h2>
          <p className="text-xs text-neutral-500 mt-0.5">By spend in the last {PERIOD_LABELS[period].toLowerCase()}</p>
        </div>
        <div className="p-4 space-y-2">
          {isLoading ? (
            [0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          ) : topCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Users size={28} className="text-neutral-300 dark:text-neutral-700" />
              <p className="text-sm text-neutral-400">No customer data for this period</p>
            </div>
          ) : (
            topCustomers.map((c, i) => (
              <div key={c.customerId ?? `walkin-${i}`}
                className="flex items-center gap-4 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-[11px] font-black text-white shrink-0">
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{c.name}</p>
                  <p className="text-xs text-neutral-500">{c.orderCount} order{c.orderCount !== 1 ? 's' : ''}</p>
                </div>
                <span className="font-black text-emerald-500 text-sm shrink-0">{fmt(c.totalSpent)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {data && (
        <p className="text-center text-[10px] text-neutral-400">
          Generated at {new Date(data.generatedAt).toLocaleTimeString('en-IN')} · Refreshes every 5 min
        </p>
      )}
    </div>
  );
}
