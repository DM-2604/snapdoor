"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { ChevronRight, Package, MapPin, Edit2, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/lib/customer-api";

export default function AccountDashboardPage() {
  const { user } = useAuthStore();
  const userName = user?.name || "Guest User";
  const userInitials = userName.substring(0, 2).toUpperCase();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["customerOrders", { limit: 3 }],
    queryFn: () => customerApi.listOrders({ limit: 3 }),
  });

  const recentOrders = ordersData?.orders ?? [];
  const totalOrdersCount = ordersData?.total ?? 0;
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-white font-bold">My Account</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Account Sidebar */}
          <AccountSidebar activeTab="dashboard" />

          {/* Main Dashboard Content */}
          <div className="flex-1 space-y-6">
            
            {/* Greeting Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-700 text-white font-black text-xl flex items-center justify-center shadow-sm shrink-0 uppercase">
                  {userInitials}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">Hello, {userName}!</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{user?.phoneNumber}</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <Edit2 size={14} />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/account/orders" className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 shadow-xs hover:border-primary transition-colors flex flex-col items-center justify-center text-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package size={20} />
                </div>
                <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">{totalOrdersCount}</h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Total Orders</p>
              </Link>
              
              <Link href="/account/addresses" className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 shadow-xs hover:border-primary transition-colors flex flex-col items-center justify-center text-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin size={20} />
                </div>
                <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">--</h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Saved Addresses</p>
              </Link>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">Recent Orders</h3>
                <Link href="/account/orders" className="text-primary font-bold text-xs hover:underline">View All</Link>
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-6 text-neutral-500 font-medium">No recent orders found.</div>
                ) : (
                  recentOrders.map(order => (
                    <Link key={order.id} href={`/account/orders/${order.id}`} className="block">
                      <div className="flex items-center justify-between p-3 border border-neutral-100 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📦</span>
                          <div>
                            <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Order #{order.orderNumber}</h4>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-neutral-900 dark:text-white block">₹{order.total.toFixed(2)}</span>
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1 inline-block">{order.status}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
