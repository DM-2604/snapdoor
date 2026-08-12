"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TrendingUp, Users, ShieldCheck, Zap, ChevronRight, Store, CircleDollarSign } from "lucide-react";

export default function SellOnGreenMartPage() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs font-sans">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary text-white py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <span className="inline-block px-3 py-1 bg-white/20 dark:bg-neutral-900/20 rounded-full font-bold text-xs uppercase tracking-wider">
              Partner With Us
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              Grow Your Business with GreenMart
            </h1>
            <p className="text-lg text-emerald-50 leading-relaxed max-w-lg">
              Reach thousands of customers in your city, manage orders effortlessly, and increase your revenue. Sell groceries, medicines, electronics, and more!
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/admin"
                className="px-8 py-4 bg-neutral-900 hover:bg-black text-white font-extrabold rounded-xl shadow-xl transition-all"
              >
                Register as a Seller
              </Link>
              <button className="px-8 py-4 bg-white/10 dark:bg-neutral-900/10 hover:bg-white/20 dark:hover:bg-neutral-900/20 border border-white/30 text-white font-extrabold rounded-xl transition-all">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full flex justify-center md:justify-end">
            <div className="w-full max-w-md aspect-square bg-white/10 dark:bg-neutral-900/10 border border-white/20 rounded-[2.5rem] p-8 flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
               {/* Mockup or Illustration Placeholder */}
               <div className="text-center space-y-4">
                 <Store size={80} className="text-white mx-auto opacity-90" />
                 <h3 className="text-2xl font-bold">Your Store, Online</h3>
               </div>
               
               {/* Floating elements */}
               <div className="absolute top-10 left-10 w-16 h-16 bg-amber-400 rounded-xl rotate-12 flex items-center justify-center shadow-lg">
                  <TrendingUp size={32} className="text-amber-900" />
               </div>
               <div className="absolute bottom-10 right-10 w-20 h-20 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                  <CircleDollarSign size={40} className="text-emerald-900" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-4">Why Sell on GreenMart?</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">Join a network of successful local vendors who have transformed their offline business into a thriving online enterprise.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, title: "Massive Local Reach", desc: "Get access to millions of customers searching for products in your city." },
              { icon: Zap, title: "Fast Onboarding", desc: "Register and start selling within 24 hours with our easy verification process." },
              { icon: ShieldCheck, title: "Secure Payments", desc: "Enjoy timely and secure payouts directly to your registered bank account." },
              { icon: TrendingUp, title: "Business Insights", desc: "Access a dedicated dashboard to track sales, manage inventory, and view analytics." },
            ].map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-primary dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">{benefit.title}</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Steps to Start */}
      <section className="py-16 px-4 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-4">How it works</h2>
            <p className="text-neutral-400 text-sm">Four simple steps to grow your business.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (desktop only) */}
            <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-0.5 bg-neutral-800" />
            
            {[
              { step: "1", title: "Register", desc: "Sign up with your GSTIN and bank details." },
              { step: "2", title: "List Products", desc: "Upload your catalog via app or bulk upload." },
              { step: "3", title: "Receive Orders", desc: "Get notifications when customers buy." },
              { step: "4", title: "Get Paid", desc: "Receive fast payments for delivered orders." },
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black text-xl mb-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-neutral-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-emerald-50 dark:bg-emerald-900/10 border-t border-emerald-100 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white">Ready to boost your sales?</h2>
          <p className="text-neutral-600 dark:text-neutral-400">Join GreenMart today and take your local store online with zero setup cost.</p>
          <Link
            href="/admin"
            className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            Start Selling Now <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
