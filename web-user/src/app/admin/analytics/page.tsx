"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  Star,
  Package,
} from "lucide-react";

const weeklyRevenue = [12400, 18200, 14500, 22100, 19800, 26300, 23450];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const maxRevenue = Math.max(...weeklyRevenue);

const categoryData = [
  { name: "Grocery", value: 42, color: "bg-emerald-500" },
  { name: "Dairy", value: 28, color: "bg-blue-500" },
  { name: "Personal Care", value: 16, color: "bg-amber-500" },
  { name: "Household", value: 9, color: "bg-purple-500" },
  { name: "Others", value: 5, color: "bg-neutral-500" },
];

const topCustomers = [
  { name: "Rahul Sharma", orders: 24, spent: "₹8,450", avatar: "RS" },
  { name: "Priya Verma", orders: 18, spent: "₹5,230", avatar: "PV" },
  { name: "Amit Singh", orders: 15, spent: "₹4,870", avatar: "AS" },
  { name: "Sunita Rao", orders: 12, spent: "₹3,960", avatar: "SR" },
  { name: "Vikram Patel", orders: 10, spent: "₹3,120", avatar: "VP" },
];

const kpis = [
  { label: "Total Orders", value: "1,842", change: "+12.4%", up: true },
  { label: "Total Revenue", value: "₹2,34,850", change: "+18.2%", up: true },
  { label: "Avg Order Value", value: "₹127", change: "+4.1%", up: true },
  { label: "Return Rate", value: "2.3%", change: "-0.8%", up: false },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Performance insights for the last 7 days</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
            <p className="text-xs text-neutral-500 font-medium mb-1">{kpi.label}</p>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">{kpi.value}</p>
            <span className={`flex items-center gap-0.5 text-xs font-bold mt-1 ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
              {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {kpi.change} vs last week
            </span>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-neutral-900 dark:text-white">Weekly Revenue</h2>
            <span className="text-xs text-neutral-500">Last 7 days</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {weeklyRevenue.map((val, i) => {
              const heightPct = (val / maxRevenue) * 100;
              const isMax = val === maxRevenue;
              return (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-[10px] text-neutral-500 font-bold">₹{(val / 1000).toFixed(1)}K</span>
                  <div className="w-full flex flex-col justify-end" style={{ height: "120px" }}>
                    <div
                      className={`w-full rounded-t-lg transition-all ${isMax ? "bg-emerald-500" : "bg-emerald-500/30"}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 font-medium">{days[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
          <h2 className="font-bold text-neutral-900 dark:text-white mb-6">Sales by Category</h2>
          <div className="space-y-3">
            {categoryData.map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">{cat.name}</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{cat.value}%</span>
                </div>
                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color}`}
                    style={{ width: `${cat.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Legend dots */}
          <div className="mt-5 flex flex-wrap gap-2">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="font-bold text-neutral-900 dark:text-white">Top Customers</h2>
        </div>
        <div className="p-4 space-y-2">
          {topCustomers.map((c, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-neutral-100 dark:bg-neutral-800/40 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-[11px] font-black text-neutral-900 dark:text-white shrink-0">
                {c.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-neutral-900 dark:text-white">{c.name}</p>
                <p className="text-xs text-neutral-500">{c.orders} orders</p>
              </div>
              <span className="font-black text-emerald-400 text-sm">{c.spent}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
