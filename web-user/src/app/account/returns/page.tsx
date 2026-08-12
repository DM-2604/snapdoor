"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { RotateCcw, CheckCircle2, ChevronRight, Headphones, ShieldCheck, FileText } from "lucide-react";

export default function ReturnsPage() {
  const returnsList = [
    {
      id: "RET98765",
      orderId: "GM1234567886",
      item: "Glow & Beauty Body Wash 250ml",
      reason: "Damaged packaging during transport",
      amount: 759,
      status: "Refund Completed",
      date: "05 May 2024",
      refundDate: "06 May 2024",
      icon: "🧴",
    },
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
        <span className="text-neutral-900 dark:text-white font-bold">Returns & Refunds</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          <AccountSidebar activeTab="returns" />

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            
            {/* Header Bar */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">Returns & Refunds</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Track active return requests and view instant refund statuses</p>
              </div>

              <Link
                href="/account/orders"
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors text-xs w-max"
              >
                Request New Return
              </Link>
            </div>

            {/* Return Request Cards */}
            <div className="space-y-4">
              {returnsList.map((ret) => (
                <div key={ret.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Return ID: {ret.id}</span>
                      <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs mt-0.5">Order ID: {ret.orderId}</h4>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>{ret.status}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{ret.icon}</span>
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-neutral-900 dark:text-white text-xs">{ret.item}</h5>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Reason: {ret.reason}</p>
                      <p className="text-[10px] text-neutral-400">Request Date: {ret.date}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Refund Amount</span>
                      <span className="font-black text-neutral-900 dark:text-white text-sm">₹{ret.amount}</span>
                    </div>

                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                      ₹{ret.amount} refunded to LocalMart Wallet on {ret.refundDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Return Policy Banner */}
            <div className="bg-emerald-50/70 dark:bg-emerald-900/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-2xl p-5 flex items-start gap-4">
              <ShieldCheck size={24} className="text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">7-Day Easy Return Policy</h4>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Items damaged or expired can be returned within 7 days of delivery for instant wallet credit or bank refund.
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
