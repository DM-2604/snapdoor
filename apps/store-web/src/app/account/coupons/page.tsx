import { notFound } from 'next/navigation';

export default function DisabledRoute() {
  notFound();
}

/* 
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Tag, Copy, Check, ChevronRight, Sparkles, Clock, AlertCircle } from "lucide-react";

export default function MyCouponsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const coupons = [
    { code: "LOCALMART50", title: "Flat ₹50 OFF", desc: "Valid on orders above ₹299 from Kirana & Grocery stores.", expiry: "31 May 2024", tag: "POPULAR" },
    { code: "WISHLIST10", title: "Extra 10% OFF", desc: "Valid on all items added from your personal Wishlist.", expiry: "15 June 2024", tag: "SPECIAL" },
    { code: "FREEDEL", title: "Free Delivery", desc: "Enjoy ₹0 delivery charge on orders above ₹199.", expiry: "30 May 2024", tag: "TRENDING" },
    { code: "WELCOME100", title: "Flat ₹100 OFF", desc: "First order discount for new localmart app users.", expiry: "30 June 2024", tag: "NEW USER" },
    { code: "PHARMA15", title: "15% OFF Medicines", desc: "Valid on prescription & healthcare items at Apollo Pharmacy.", expiry: "20 May 2024", tag: "HEALTH" },
  ];

  const handleCopy = (code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />

      {/* Breadcrumb * /}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <Link href="/account" className="hover:text-primary">My Account</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-white font-bold">My Coupons</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          <AccountSidebar activeTab="coupons" />

          {/* Main Content * /}
          <div className="flex-1 space-y-6">
            
            {/* Header Bar * /}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">My Coupons & Vouchers</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Apply coupon codes during checkout to save extra money</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  className="px-3 py-2 uppercase bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs outline-none focus:border-primary w-40 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                />
                <button className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors text-xs">
                  Apply
                </button>
              </div>
            </div>

            {/* Coupons Grid * /}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map((c) => (
                <div
                  key={c.code}
                  className="bg-white dark:bg-neutral-900 border-2 border-dashed border-emerald-300/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-primary transition-all relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {c.tag}
                      </span>
                      <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm pt-1">{c.title}</h3>
                    </div>

                    <div className="p-2 bg-emerald-50 text-primary rounded-xl font-mono font-extrabold text-xs border border-emerald-200">
                      {c.code}
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">{c.desc}</p>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
                      <Clock size={12} />
                      <span>Expires: {c.expiry}</span>
                    </div>

                    <button
                      onClick={() => handleCopy(c.code)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                        copiedCode === c.code
                          ? "bg-emerald-700 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-100"
                      }`}
                    >
                      {copiedCode === c.code ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedCode === c.code ? "Copied!" : "Copy Code"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

*/
