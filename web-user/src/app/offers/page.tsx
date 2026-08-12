"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Tag, Sparkles, Clock, Copy, Check, ChevronRight, ShoppingCart, Percent, Zap } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function OffersPage() {
  const { incrementCart } = useStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const bankOffers = [
    { title: "10% Instant Discount", desc: "On SBI Credit Cards above ₹999", code: "SBI10", color: "bg-blue-600" },
    { title: "Flat ₹100 Cashback", desc: "On Paytm Wallet transactions above ₹499", code: "PAYTM100", color: "bg-cyan-600" },
    { title: "5% Unlimited Cashback", desc: "On Flipkart Axis Bank Credit Card", code: "AXIS5", color: "bg-red-600" },
  ];

  const dealProducts = [
    { name: "Aashirvaad Whole Wheat Atta 5kg", price: 265, original: 300, discount: "12% OFF", icon: "🌾" },
    { name: "Amul Gold Full Cream Milk 1L", price: 68, original: 76, discount: "10% OFF", icon: "🥛" },
    { name: "Fortune Sunlite Refined Oil 1L", price: 145, original: 165, discount: "12% OFF", icon: "🌻" },
    { name: "Good Life Toor Dal 1kg", price: 110, original: 130, discount: "15% OFF", icon: "🫘" },
  ];

  const handleCopy = (code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-white font-bold">Exclusive Offers</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 space-y-8">
        
        {/* Flash Sale Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
              <Zap size={12} className="fill-amber-950" />
              FLASH SALE ENDS SOON
            </span>
            <h1 className="text-2xl md:text-4xl font-black">Up to 60% OFF on Everyday Groceries!</h1>
            <p className="text-xs md:text-sm text-emerald-200">Shop fresh vegetables, dairy, pulses, and household items at wholesale prices.</p>
          </div>

          <div className="bg-white/10 dark:bg-neutral-900/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center space-y-2 shrink-0">
            <span className="text-[11px] font-bold text-emerald-200">Sale Ends In</span>
            <div className="flex items-center gap-2 text-xl font-black text-white">
              <span className="bg-white/20 dark:bg-neutral-900/20 px-2.5 py-1 rounded-lg">12h</span>
              <span>:</span>
              <span className="bg-white/20 dark:bg-neutral-900/20 px-2.5 py-1 rounded-lg">45m</span>
              <span>:</span>
              <span className="bg-white/20 dark:bg-neutral-900/20 px-2.5 py-1 rounded-lg">20s</span>
            </div>
          </div>
        </div>

        {/* Bank Offers Carousel / Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">Bank & Wallet Partner Offers</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bankOffers.map((b) => (
              <div key={b.code} className={`${b.color} text-white rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden`}>
                <div className="flex items-start justify-between">
                  <Percent size={28} className="opacity-80" />
                  <span className="font-mono font-black text-xs bg-white/20 dark:bg-neutral-900/20 px-2.5 py-1 rounded-md">{b.code}</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">{b.title}</h3>
                  <p className="text-[11px] text-white/80 mt-0.5">{b.desc}</p>
                </div>
                <button
                  onClick={() => handleCopy(b.code)}
                  className="w-full py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-bold rounded-xl text-xs hover:bg-white/90 dark:hover:bg-neutral-900/90 transition-colors flex items-center justify-center gap-1"
                >
                  {copiedCode === b.code ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCode === b.code ? "Code Copied!" : "Copy Promo Code"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Deal of the Day Products */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">Deal of the Day</h2>
            <Link href="/search" className="text-xs font-bold text-primary hover:underline">View All Deals</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {dealProducts.map((prod, idx) => (
              <div key={idx} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 shadow-xs space-y-3 hover:border-primary transition-all group flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-full h-28 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                    {prod.icon}
                  </div>
                  <span className="text-[10px] font-black text-success bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                    {prod.discount}
                  </span>
                  <h3 className="font-bold text-neutral-900 dark:text-white text-xs line-clamp-2">{prod.name}</h3>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-baseline gap-2">
                    <span className="font-extrabold text-neutral-900 dark:text-white text-sm">₹{prod.price}</span>
                    <span className="text-[11px] text-neutral-400 line-through">₹{prod.original}</span>
                  </div>

                  <button
                    onClick={() => incrementCart(prod.name)}
                    className="w-full py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart size={14} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
