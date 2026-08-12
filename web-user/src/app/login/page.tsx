"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Successfully ${isLogin ? 'logged in' : 'signed up'}!`);
    router.push("/");
  };

  const handleSocialAuth = (provider: string) => {
    alert(`Connecting with ${provider}...`);
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col font-sans">
      <Header />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-3xl shadow-xl overflow-hidden">
          
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center space-y-2 border-b border-neutral-100 dark:border-neutral-800">
            <div className="w-12 h-12 bg-emerald-100 text-primary rounded-xl flex items-center justify-center font-black text-2xl mx-auto mb-4">
              G
            </div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
              {isLogin ? "Welcome Back!" : "Create an Account"}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {isLogin ? "Sign in to access your orders and wishlist." : "Join GreenMart for the best local deals."}
            </p>
          </div>

          {/* Form */}
          <div className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                      <User size={16} />
                    </div>
                    <input 
                      type="text" 
                      required 
                      placeholder="Rahul Sharma"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Mail size={16} />
                  </div>
                  <input 
                    type="email" 
                    required 
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Password</label>
                  {isLogin && (
                    <Link href="/support?tab=contact" className="text-xs font-bold text-primary hover:underline">Forgot Password?</Link>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Lock size={16} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 transition-all mt-4"
              >
                {isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200"></div>
              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">or continue with</span>
              <div className="h-px flex-1 bg-neutral-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => handleSocialAuth('Google')}
                className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-950 rounded-xl transition-colors text-sm font-bold text-neutral-700 dark:text-neutral-300 shadow-xs"
              >
                <FaGoogle className="text-red-500" />
                <span>Google</span>
              </button>
              <button 
                type="button"
                onClick={() => handleSocialAuth('Facebook')}
                className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-950 rounded-xl transition-colors text-sm font-bold text-neutral-700 dark:text-neutral-300 shadow-xs"
              >
                <FaFacebookF className="text-blue-600" />
                <span>Facebook</span>
              </button>
            </div>

          </div>

          {/* Footer Link */}
          <div className="p-6 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 text-center text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 font-bold text-primary hover:underline transition-all"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
