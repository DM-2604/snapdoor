"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  ChevronRight,
  Headphones,
  Bell,
  Map,
  Copy,
  ChevronDown,
} from "lucide-react";
import { useStore } from "@/store/useStore";

export default function TrackOrderPage() {
  const { incrementCart } = useStore();

  const recommendations = [
    { name: "Tata Salt Iodised", pack: "1 kg", price: 20, icon: "🧂" },
    { name: "Red Label Black Tea", pack: "250 g", price: 182, icon: "☕" },
    { name: "Maggi 2-Minute Noodles", pack: "280 g", price: 24, icon: "🍜" },
    { name: "Dettol Antiseptic Liquid", pack: "550 ml", price: 193, icon: "🧴" },
    { name: "Surf Excel Matic", pack: "1 kg", price: 195, icon: "🧺" },
  ];

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
        <span className="text-neutral-900 dark:text-white font-bold">Order Tracking</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 space-y-6">
        
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">Track Your Order</h2>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <span>Order ID: <strong className="text-neutral-800 dark:text-neutral-100 font-mono">GM1234567890</strong></span>
              <span>•</span>
              <span>Placed on 12 May 2024, 10:30 AM</span>
            </div>
          </div>

          <button className="flex items-center gap-1.5 px-4 py-2 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-xl font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-max">
            <Headphones size={16} className="text-primary" />
            <span>Need Help?</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Stepper Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xs space-y-8">
              
              {/* Timeline Horizontal Progress Bar */}
              <div className="relative flex items-center justify-between">
                {/* Background line */}
                <div className="absolute left-6 right-6 top-5 h-1 bg-neutral-200 -z-0" />
                <div className="absolute left-6 w-[55%] top-5 h-1 bg-primary -z-0" />

                {/* Step 1: Order Placed */}
                <div className="flex flex-col items-center text-center z-10 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-primary text-primary flex items-center justify-center font-bold shadow-xs">
                    <CheckCircle2 size={20} className="fill-primary text-white" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-neutral-900 dark:text-white text-xs">Order Placed</h5>
                    <p className="text-[10px] text-neutral-400">12 May, 10:30 AM</p>
                  </div>
                </div>

                {/* Step 2: Confirmed */}
                <div className="flex flex-col items-center text-center z-10 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-primary text-primary flex items-center justify-center font-bold shadow-xs">
                    <CheckCircle2 size={20} className="fill-primary text-white" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-neutral-900 dark:text-white text-xs">Confirmed</h5>
                    <p className="text-[10px] text-neutral-400">12 May, 10:32 AM</p>
                  </div>
                </div>

                {/* Step 3: Shipped (Active) */}
                <div className="flex flex-col items-center text-center z-10 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md ring-4 ring-emerald-100">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h5 className="font-black text-primary text-xs">Shipped</h5>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold">13 May, 09:15 AM</p>
                  </div>
                </div>

                {/* Step 4: Out for Delivery */}
                <div className="flex flex-col items-center text-center z-10 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-400 flex items-center justify-center font-bold">
                    <Package size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-neutral-600 dark:text-neutral-400 text-xs">Out for Delivery</h5>
                    <p className="text-[10px] text-neutral-400">Today, 11:20 AM</p>
                  </div>
                </div>

                {/* Step 5: Delivered */}
                <div className="flex flex-col items-center text-center z-10 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-400 flex items-center justify-center font-bold">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-neutral-400 text-xs">Delivered</h5>
                    <p className="text-[10px] text-neutral-400">Expected Today</p>
                  </div>
                </div>

              </div>

              {/* Courier & Tracking Details Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Estimated Delivery</span>
                  <h4 className="font-black text-primary text-sm">Today by 02:00 PM</h4>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">15 May 2024</p>
                </div>

                <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Shipping Partner</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-white text-xs">Shadowfax</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                    <span>SF1234567890</span>
                    <button onClick={() => alert("Copied Tracking ID")} className="text-neutral-400 hover:text-primary">
                      <Copy size={10} />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 rounded-xl space-y-2 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Live Tracking</span>
                  <button className="w-full py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors">
                    <Map size={14} />
                    <span>Track on Map</span>
                  </button>
                </div>
              </div>

              {/* Status Update Banner */}
              <div className="bg-emerald-50/70 dark:bg-emerald-900/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shrink-0">
                    🛵
                  </div>
                  <div>
                    <h5 className="font-extrabold text-neutral-900 dark:text-white text-xs">Your order is on the way!</h5>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                      Our delivery partner has picked up your order and is on the way to deliver.
                    </p>
                  </div>
                </div>

                <button className="flex items-center gap-1 text-xs font-bold text-primary hover:underline shrink-0">
                  <Bell size={14} />
                  <span>Order Updates</span>
                  <ChevronDown size={14} />
                </button>
              </div>

            </div>

            {/* You Might Also Like Carousel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">You might also like</h3>
                <Link href="/search" className="text-xs font-bold text-primary hover:underline">View All &gt;</Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {recommendations.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-3 hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div className="w-full h-20 bg-neutral-50 dark:bg-neutral-950 rounded-xl flex items-center justify-center text-3xl mb-2">
                      {item.icon}
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-neutral-800 dark:text-neutral-100 text-[11px] truncate">{item.name}</h5>
                      <p className="text-[10px] text-neutral-400">{item.pack}</p>
                      <span className="font-extrabold text-neutral-900 dark:text-white text-xs block">₹{item.price}</span>
                    </div>
                    <button
                      onClick={() => incrementCart(item.name)}
                      className="w-full mt-2 py-1 text-[11px] font-bold text-primary border border-primary/50 hover:bg-primary hover:text-white rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Order Summary */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">Order Summary</h4>
                <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">4 Items</span>
              </div>

              <div className="space-y-3 max-h-56 overflow-y-auto no-scrollbar pr-1">
                {[
                  { name: "Aashirvaad Whole Wheat Atta", pack: "5 kg", qty: 1, price: 265, icon: "🌾" },
                  { name: "Fortune Sunlite Refined Oil", pack: "1 L", qty: 1, price: 145, icon: "🌻" },
                  { name: "Mother Dairy Toned Milk", pack: "1 L", qty: 2, price: 108, icon: "🥛" },
                  { name: "Colgate MaxFresh Toothpaste", pack: "150 g", qty: 1, price: 99, icon: "🪥" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-neutral-50">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h5 className="font-bold text-neutral-800 dark:text-neutral-100 line-clamp-1">{item.name}</h5>
                        <p className="text-[10px] text-neutral-400">{item.pack} • Qty: {item.qty}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-neutral-900 dark:text-white">₹{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t border-neutral-200 dark:border-neutral-800/80 text-xs">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900 dark:text-white">₹617</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Item Discount</span>
                  <span>- ₹81</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Platform Fee</span>
                  <span className="font-bold text-neutral-900 dark:text-white">₹10</span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 block">Total Amount</span>
                  <span className="text-xl font-black text-neutral-900 dark:text-white">₹546</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md">
                  ₹121 saved
                </span>
              </div>
            </div>

            {/* Delivery Address Box */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">Delivery Address</h4>
                <button className="text-primary font-bold text-[11px] hover:underline">Change</button>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white">
                  <MapPin size={14} className="text-primary" />
                  <span>Rahul Sharma</span>
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed pl-5">
                  101, Park View Apartments, Connaught Place, New Delhi - 110001, Delhi
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 text-[11px] font-medium pl-5 pt-1">
                  Mobile: +91 98765 43210
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      <Footer />
    </main>
  );
}
