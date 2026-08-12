"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Gift, Share2, Copy, Check, ChevronRight, Users, Trophy, MessageCircle } from "lucide-react";

export default function ReferPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = "RAHUL50";

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <span className="text-neutral-900 dark:text-white font-bold">Refer & Earn</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          <AccountSidebar activeTab="refer" />

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            
            {/* Refer & Earn Hero Card */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden space-y-4">
              <div className="max-w-md space-y-2">
                <span className="text-[10px] font-black bg-white/20 dark:bg-neutral-900/20 px-2.5 py-1 rounded-full text-white uppercase tracking-wider">
                  EARN UNLIMITED CASHBACK
                </span>
                <h2 className="text-2xl font-black leading-tight">Invite Friends & Earn ₹100 LocalMart Cash!</h2>
                <p className="text-xs text-emerald-100">
                  Give your friends ₹50 OFF on their 1st grocery order and get ₹100 added directly to your wallet.
                </p>
              </div>

              {/* Referral Code Box */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <div className="bg-white/10 dark:bg-neutral-900/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 flex items-center justify-between w-full sm:w-auto min-w-[220px]">
                  <span className="text-xs font-medium text-emerald-200">Your Code:</span>
                  <span className="font-mono font-black text-white text-base tracking-widest">{referralCode}</span>
                </div>

                <button
                  onClick={handleCopy}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? "Copied to Clipboard!" : "Copy Code"}</span>
                </button>

                <a
                  href={`https://wa.me/?text=Use my code ${referralCode} to get ₹50 OFF on your first grocery order on LocalMart!`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageCircle size={16} />
                  <span>Share on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* How it Works Stepper */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">How it Works</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-primary font-black mx-auto flex items-center justify-center text-sm">
                    1
                  </div>
                  <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Share Your Code</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Send your referral link or code to friends & family.</p>
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-primary font-black mx-auto flex items-center justify-center text-sm">
                    2
                  </div>
                  <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Friend Places Order</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Your friend gets ₹50 instant discount on their 1st order.</p>
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-primary font-black mx-auto flex items-center justify-center text-sm">
                    3
                  </div>
                  <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Get ₹100 Cashback</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Once delivered, ₹100 will be added to your LocalMart Wallet!</p>
                </div>
              </div>
            </div>

            {/* Referral Earnings Summary */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">Referral Rewards Summary</h3>
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-xs">
                  Total Earned: ₹300
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Aman Verma", date: "10 May 2024", reward: "+₹100 Credited", status: "Completed" },
                  { name: "Pooja Sharma", date: "04 May 2024", reward: "+₹100 Credited", status: "Completed" },
                  { name: "Vikas Singh", date: "28 April 2024", reward: "+₹100 Credited", status: "Completed" },
                ].map((ref, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-neutral-100 dark:border-neutral-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-center">
                        {ref.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white text-xs">{ref.name}</h4>
                        <span className="text-[10px] text-neutral-400">{ref.date}</span>
                      </div>
                    </div>

                    <span className="font-bold text-emerald-700 text-xs">{ref.reward}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
