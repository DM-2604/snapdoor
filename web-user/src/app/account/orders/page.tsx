"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  Truck,
  RotateCcw,
  Wallet,
  FileText,
  MapPin,
  Headphones,
  ChevronRight,
  MoreVertical,
  Copy,
} from "lucide-react";

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const orders = [
    {
      id: "GM1234567890",
      date: "12 May 2024, 10:30 AM",
      store: "Gupta Kirana Store",
      itemsCount: 4,
      amount: 546,
      paymentMethod: "Online Payment",
      status: "Delivered",
      statusDate: "Delivered on: 13 May 2024, 12:20 PM",
      icon: "📦",
    },
    {
      id: "GM1234567889",
      date: "10 May 2024, 08:15 PM",
      store: "Apollo Pharmacy",
      itemsCount: 3,
      amount: 1108,
      paymentMethod: "Online Payment",
      status: "Shipped",
      statusDate: "Expected Delivery: 15 May 2024",
      icon: "💊",
    },
    {
      id: "GM1234567888",
      date: "09 May 2024, 04:45 PM",
      store: "Digital World",
      itemsCount: 2,
      amount: 2499,
      paymentMethod: "COD",
      status: "Processing",
      statusDate: "Expected Delivery: 17 May 2024",
      icon: "🎧",
    },
    {
      id: "GM1234567887",
      date: "07 May 2024, 11:20 AM",
      store: "Fresh Mart",
      itemsCount: 5,
      amount: 385,
      paymentMethod: "Online Payment",
      status: "Delivered",
      statusDate: "Delivered on: 08 May 2024, 10:40 AM",
      icon: "🥬",
    },
    {
      id: "GM1234567886",
      date: "05 May 2024, 09:10 PM",
      store: "Glow & Beauty Store",
      itemsCount: 3,
      amount: 759,
      paymentMethod: "Online Payment",
      status: "Cancelled",
      statusDate: "Cancelled on: 05 May 2024, 09:15 PM",
      icon: "🧴",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">Delivered</span>;
      case "Shipped":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">Shipped</span>;
      case "Processing":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">Processing</span>;
      case "Cancelled":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">{status}</span>;
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
        <span className="text-neutral-900 dark:text-white font-bold">My Orders</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Account Sidebar */}
          <AccountSidebar activeTab="orders" />

          {/* Main Orders Content */}
          <div className="flex-1 space-y-6">
            
            {/* Header with Title & Search/Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">My Orders</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Track, manage and reorder your items</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by order ID or item..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none focus:border-primary w-52 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                  <Search size={14} className="absolute left-2.5 top-2 text-neutral-400" />
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <Filter size={14} />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Order Status Tabs */}
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar border-b border-neutral-200 dark:border-neutral-800 font-bold text-xs">
              {[
                { id: "all", label: "All Orders" },
                { id: "delivered", label: "Delivered" },
                { id: "processing", label: "Processing" },
                { id: "shipped", label: "Shipped" },
                { id: "cancelled", label: "Cancelled" },
                { id: "returned", label: "Returned" },
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

            {/* Order Cards List */}
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{order.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-neutral-900 dark:text-white text-xs">Order ID: {order.id}</span>
                          <button
                            onClick={() => alert(`Copied ${order.id}`)}
                            className="text-neutral-400 hover:text-primary"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <p className="text-[11px] text-neutral-400">Placed on: {order.date}</p>
                        <h4 className="font-bold text-xs text-neutral-800 dark:text-neutral-100 flex items-center gap-1 mt-0.5">
                          <span>{order.store}</span>
                          <CheckCircle2 size={12} className="text-primary fill-primary text-white inline" />
                        </h4>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between gap-1">
                      <div>
                        <span className="font-black text-sm text-neutral-900 dark:text-white">₹{order.amount}</span>
                        <span className="text-[10px] text-neutral-400 block">{order.paymentMethod}</span>
                      </div>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11px] font-medium">{order.statusDate}</p>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/account/orders/${order.id}/track`}
                        className="px-4 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:border-primary text-neutral-800 dark:text-neutral-100 font-bold rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors"
                      >
                        View Details
                      </Link>

                      {order.status === "Delivered" && (
                        <button className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors">
                          Reorder
                        </button>
                      )}

                      {order.status === "Shipped" && (
                        <Link
                          href={`/account/orders/${order.id}/track`}
                          className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors"
                        >
                          Track Order
                        </Link>
                      )}

                      {order.status === "Processing" && (
                        <button className="px-4 py-1.5 border border-red-300 text-danger hover:bg-red-50 font-bold rounded-xl transition-colors">
                          Cancel Order
                        </button>
                      )}

                      <button className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 text-xs font-bold text-neutral-600 dark:text-neutral-400">
              <span>Showing 1 to 5 of 24 orders</span>
              <div className="flex items-center gap-1.5">
                <button className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center">1</button>
                <button className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 flex items-center justify-center">2</button>
                <button className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 flex items-center justify-center">3</button>
                <span>...</span>
                <button className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 flex items-center justify-center">5</button>
                <button className="px-3 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 flex items-center justify-center gap-1">Next &gt;</button>
              </div>
            </div>

          </div>

          {/* Right Summary Panel */}
          <div className="w-full md:w-72 space-y-6 shrink-0">
            
            {/* Account Summary Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">Account Summary</h4>
                <button className="text-primary font-bold text-[11px] hover:underline">View All</button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Total Orders</span>
                  <span className="font-extrabold text-neutral-900 dark:text-white">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Delivered Orders</span>
                  <span className="font-extrabold text-emerald-600">18</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Cancelled Orders</span>
                  <span className="font-extrabold text-red-500">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Returned Orders</span>
                  <span className="font-extrabold text-amber-600">2</span>
                </div>
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <span className="font-bold text-neutral-800 dark:text-neutral-100">Total Spent</span>
                  <span className="font-black text-primary text-sm">₹18,760</span>
                </div>
              </div>
            </div>

            {/* Wallet Balance Card */}
            <div className="bg-emerald-50/70 dark:bg-emerald-900/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-md">
                  <Wallet size={20} />
                </div>
                <div>
                  <h5 className="font-extrabold text-neutral-900 dark:text-white text-xs">You have ₹320 in wallet</h5>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Use it on your next order</p>
                </div>
              </div>

              <button className="w-full py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors text-xs">
                View Wallet
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">Quick Actions</h4>

              <div className="space-y-2 text-xs">
                <Link href="/account/orders/GM1234567890/track" className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors font-bold text-neutral-700 dark:text-neutral-300">
                  <Truck size={16} className="text-primary" />
                  <span>Track Your Order</span>
                </Link>
                <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <FileText size={16} className="text-primary" />
                  <span>Download Invoices</span>
                </div>
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
