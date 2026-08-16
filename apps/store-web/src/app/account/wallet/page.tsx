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
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  History,
  Sparkles,
} from "lucide-react";

export default function MyWalletPage() {
  const [balance, setBalance] = useState(320);
  const [topUpAmount, setTopUpAmount] = useState("500");

  const transactions = [
    { id: "TXN987654", title: "Paid for Order #GM1234567890", date: "12 May 2024, 10:32 AM", amount: -546, type: "debit" },
    { id: "TXN987653", title: "Cashback Received (WISHLIST10)", date: "10 May 2024, 08:20 PM", amount: 50, type: "credit" },
    { id: "TXN987652", title: "Added to Wallet via UPI", date: "08 May 2024, 02:15 PM", amount: 500, type: "credit" },
    { id: "TXN987651", title: "Refund for Cancelled Order #GM1234567886", date: "05 May 2024, 09:20 PM", amount: 316, type: "credit" },
  ];

  const handleAddMoney = () => {
    const val = parseInt(topUpAmount) || 0;
    if (val > 0) {
      setBalance((prev) => prev + val);
      alert(`Successfully added ₹${val} to your LocalMart Wallet!`);
    }
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
        <span className="text-neutral-900 dark:text-white font-bold">My Wallet</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          <AccountSidebar activeTab="wallet" />

          {/* Main Content * /}
          <div className="flex-1 space-y-6">
            
            {/* Wallet Balance Hero Card * /}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-neutral-900/10 backdrop-blur-md flex items-center justify-center">
                    <Wallet size={20} className="text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-emerald-100">LocalMart Pay Balance</h3>
                    <p className="text-[10px] text-emerald-200">100% Instant & Secure Payments</p>
                  </div>
                </div>

                <span className="text-[10px] font-black bg-emerald-700/80 px-2.5 py-1 rounded-full text-emerald-100 border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>

              <div>
                <span className="text-3xl font-black">₹{balance}</span>
                <span className="text-xs text-emerald-200 ml-2">Available Balance</span>
              </div>

              {/* Add Money Form * /}
              <div className="pt-3 border-t border-emerald-700/60 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 dark:bg-neutral-900/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 w-full sm:w-auto">
                  <span className="font-bold text-emerald-200">₹</span>
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="bg-transparent outline-none text-white font-extrabold w-28 text-xs placeholder:text-emerald-300 text-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {["100", "500", "1000", "2000"].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setTopUpAmount(amt)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 dark:bg-neutral-900/10 hover:bg-white/20 dark:hover:bg-neutral-900/20 text-emerald-100 text-xs font-bold transition-colors shrink-0"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleAddMoney}
                  className="w-full sm:w-auto sm:ml-auto px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus size={16} />
                  <span>Add Money</span>
                </button>
              </div>
            </div>

            {/* Recent Transactions List * /}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2 font-extrabold text-neutral-900 dark:text-white text-sm">
                  <History size={18} className="text-primary" />
                  <h3>Transaction History</h3>
                </div>
                <button className="text-primary font-bold text-xs hover:underline">Download Statement</button>
              </div>

              <div className="space-y-3">
                {transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-950/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        txn.type === "credit" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}>
                        {txn.type === "credit" ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white text-xs">{txn.title}</h4>
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{txn.id} • {txn.date}</p>
                      </div>
                    </div>

                    <span className={`font-black text-sm ${
                      txn.type === "credit" ? "text-emerald-700" : "text-neutral-900 dark:text-white"
                    }`}>
                      {txn.type === "credit" ? `+₹${txn.amount}` : `-₹${Math.abs(txn.amount)}`}
                    </span>
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

*/
