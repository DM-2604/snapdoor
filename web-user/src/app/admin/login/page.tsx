"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Store } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    router.push("/admin");
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-50 dark:bg-neutral-950 p-8 text-center text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Store size={24} className="text-neutral-900 dark:text-white" />
          </div>
          <h1 className="text-2xl font-black mb-1">{BRAND_CONFIG.name} Admin</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Sign in to manage your store</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@greenmart.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Password</label>
                <a href="#" className="text-[10px] font-bold text-emerald-500 hover:underline">Forgot Password?</a>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-neutral-900 dark:text-white font-extrabold text-sm rounded-lg shadow-lg shadow-emerald-900/50 transition-all flex items-center justify-center gap-2 mt-4"
            >
              Sign In <ArrowRight size={16} />
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-neutral-500">
            Don&apos;t have a seller account?{" "}
            <Link href="/admin/register" className="font-bold text-emerald-500 hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
