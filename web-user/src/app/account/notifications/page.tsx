"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Bell, CheckCheck, Truck, Tag, Wallet, PackageCheck, ChevronRight } from "lucide-react";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([
    { id: "1", type: "order", title: "Order Shipped!", desc: "Order #GM1234567889 has been picked up by Shadowfax delivery partner.", time: "10 min ago", unread: true, icon: Truck },
    { id: "2", type: "offer", title: "Price Drop Alert!", desc: "Aashirvaad Whole Wheat Atta 5kg price dropped by ₹35 in your wishlist.", time: "2 hours ago", unread: true, icon: Tag },
    { id: "3", type: "wallet", title: "Cashback Credited", desc: "₹50 cashback has been credited to your LocalMart Pay balance.", time: "1 day ago", unread: false, icon: Wallet },
    { id: "4", type: "order", title: "Order Delivered Successfully", desc: "Order #GM1234567890 delivered by Gupta Kirana Store. Rate your experience!", time: "2 days ago", unread: false, icon: PackageCheck },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
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
        <span className="text-neutral-900 dark:text-white font-bold">Notifications</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          <AccountSidebar activeTab="notifications" />

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            
            {/* Header Bar */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">Notifications</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Stay updated on your orders, wallet credits, and special offers</p>
              </div>

              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-max"
              >
                <CheckCheck size={14} className="text-primary" />
                <span>Mark All as Read</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800 font-bold text-xs">
              {[
                { id: "all", label: "All Notifications" },
                { id: "order", label: "Orders" },
                { id: "offer", label: "Offers & Deals" },
                { id: "wallet", label: "Wallet" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2.5 transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {notifications
                .filter((n) => activeTab === "all" || n.type === activeTab)
                .map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={`bg-white dark:bg-neutral-900 border rounded-2xl p-4 shadow-xs flex items-start gap-4 transition-all ${
                        n.unread
                          ? "border-primary/60 bg-emerald-50/20"
                          : "border-neutral-200 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-primary flex items-center justify-center font-bold shrink-0">
                        <Icon size={20} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">{n.title}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-neutral-400 font-medium">{n.time}</span>
                            <button 
                              onClick={() => setNotifications(notifications.filter(notif => notif.id !== n.id))}
                              className="text-neutral-400 hover:text-danger transition-colors"
                            >
                              <span className="text-xs font-bold">×</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">{n.desc}</p>
                      </div>
                    </div>
                  );
                })}
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
