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
  Heart,
  Share2,
  ChevronDown,
  Star,
  CheckCircle2,
  ShoppingBag,
  Bell,
  Sparkles,
  ChevronRight,
  Gift,
} from "lucide-react";
import { useStore } from "@/store/useStore";

export default function MyWishlistPage() {
  const { incrementCart, wishlistItems: storeWishlist, toggleWishlist } = useStore();

  const allProducts = [
    { id: "1", name: "Aashirvaad Whole Wheat Atta", pack: "5 kg", store: "Gupta Kirana Store", rating: 4.6, reviews: "12.5K", price: 265, originalPrice: 300, discount: "12% OFF", icon: "🌾" },
    { id: "2", name: "Fortune Sunlite Refined Oil", pack: "1 L", store: "Fresh Mart", rating: 4.5, reviews: "9.8K", price: 145, originalPrice: 153, discount: "8% OFF", icon: "🌻" },
    { id: "3", name: "Mother Dairy Toned Milk", pack: "1 L", store: "Apollo Pharmacy", rating: 4.8, reviews: "7.2K", price: 54, originalPrice: 60, discount: "10% OFF", icon: "🥛" },
    { id: "4", name: "Red Label Black Tea", pack: "500 g", store: "Gupta Kirana Store", rating: 4.5, reviews: "6.1K", price: 182, originalPrice: 228, discount: "15% OFF", icon: "☕" },
    { id: "5", name: "boAt Rockerz 450", pack: "Headphones", store: "Digital World", rating: 4.4, reviews: "3.2K", price: 2499, originalPrice: 3990, discount: "37% OFF", icon: "🎧" },
    { id: "6", name: "Bingo! Mad Angles", pack: "66 g", store: "City Supermarket", rating: 4.4, reviews: "5.6K", price: 20, originalPrice: 22, discount: "9% OFF", icon: "🍿" },
    { id: "7", name: "Dove Deeply Nourishing Body Wash", pack: "250 ml", store: "Glow & Beauty Store", rating: 4.7, reviews: "2.1K", price: 212, originalPrice: 229, discount: "7% OFF", icon: "🧴" },
    { id: "8", name: "Amul Pure Ghee", pack: "1 L", store: "Fresh Mart", rating: 4.6, reviews: "4.8K", price: 535, originalPrice: 599, discount: "11% OFF", icon: "🧈" },
    { id: "9", name: "Ariel Matic Front Load Detergent", pack: "2 kg", store: "City Supermarket", rating: 4.5, reviews: "3.9K", price: 487, originalPrice: 559, discount: "13% OFF", icon: "🧺" },
    { id: "10", name: "Indoor Plant (Money Plant)", pack: "Pot Included", store: "Green Nursery", rating: 4.6, reviews: "1.2K", price: 199, originalPrice: 249, discount: "20% OFF", icon: "🪴" },
  ];

  const recommendations = [
    { name: "Tata Salt Iodised", pack: "1 kg", price: 20, icon: "🧂" },
    { name: "Maggi 2-Minute Noodles", pack: "280 g", price: 24, icon: "🍜" },
    { name: "Colgate Strong Teeth", pack: "200 g", price: 99, icon: "🪥" },
    { name: "Dettol Original Soap", pack: "125 g", price: 48, icon: "🧼" },
  ];

  const wishlist = allProducts.filter((item) => storeWishlist.includes(item.name));

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
        <span className="text-neutral-900 dark:text-white font-bold">My Wishlist</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Account Sidebar * /}
          <AccountSidebar activeTab="wishlist" />

          {/* Main Content * /}
          <div className="flex-1 space-y-6">
            
            {/* Wishlist Header Bar * /}
            <div className="relative overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group transition-colors">
              {/* Decorative Background Element * /}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/15 dark:group-hover:bg-emerald-500/10 transition-colors duration-700"></div>
              
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 shrink-0 shadow-sm border border-red-100 dark:border-red-500/20">
                    <Heart size={24} className="fill-red-500/20" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                    My Wishlist <span className="text-neutral-400 dark:text-neutral-500 font-bold text-xl md:text-2xl">({wishlist.length})</span>
                  </h2>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium max-w-sm">
                  All your favorite products saved in one place. Ready to checkout?
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap items-center gap-3">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 rounded-xl font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-sm">
                  <Share2 size={16} className="text-neutral-400" />
                  <span>Share</span>
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 rounded-xl font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-sm">
                  <span>Categories</span>
                  <ChevronDown size={16} className="text-neutral-400" />
                </button>
                <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 dark:shadow-emerald-900/40 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all">
                  <ShoppingBag size={16} />
                  <span>Move All to Cart</span>
                </button>
              </div>
            </div>

            {/* Wishlist Grid * /}
            {wishlist.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-12 shadow-xs text-center flex flex-col items-center justify-center">
                <Heart size={48} className="text-neutral-200 mb-4" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Your Wishlist is Empty</h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-6">Looks like you haven't added anything to your wishlist yet.</p>
                <Link href="/search" className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors">
                  Explore Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 hover:shadow-md transition-shadow relative flex flex-col justify-between group"
                  >
                    <button 
                      onClick={() => toggleWishlist(item.name)}
                      className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-red-50 text-danger flex items-center justify-center z-10 shadow-2xs hover:scale-110 transition-transform"
                    >
                      <Heart size={14} className="fill-danger" />
                    </button>

                  {item.discount && (
                    <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded z-10">
                      {item.discount}
                    </span>
                  )}

                  <Link href={`/product/${item.id}`} className="block cursor-pointer">
                    <div className="w-full h-32 bg-neutral-50 dark:bg-neutral-950 rounded-xl flex items-center justify-center text-5xl mb-3 group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-sm font-extrabold text-neutral-800 dark:text-neutral-100 line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[40px]">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                        <span className="truncate">{item.store}</span>
                        <CheckCircle2 size={12} className="text-primary fill-primary text-white inline shrink-0" />
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-400 pt-1">
                        <Star size={12} className="text-warning fill-warning" />
                        <span className="font-bold">{item.rating}</span>
                        <span className="text-neutral-400">({item.reviews})</span>
                      </div>
                    </div>
                  </Link>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 mt-3 space-y-3">
                    <div className="flex items-baseline gap-1">
                      <span className="font-extrabold text-xs text-neutral-900 dark:text-white">₹{item.price}</span>
                      {item.originalPrice && (
                        <span className="text-[10px] text-neutral-400 line-through">₹{item.originalPrice}</span>
                      )}
                    </div>

                    <button
                      onClick={() => incrementCart(item.name)}
                      className="w-full py-1.5 text-xs font-bold text-primary border border-primary/50 hover:bg-primary hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <ShoppingBag size={12} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}

          </div>

          {/* Right Summary Panel * /}
          <div className="w-full md:w-72 space-y-6 shrink-0">
            
            {/* You Might Also Like * /}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">You might also like</h4>
                <Link href="/search" className="text-primary font-bold text-[11px] hover:underline">View All</Link>
              </div>

              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-neutral-50 last:border-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">{rec.icon}</span>
                      <div className="min-w-0">
                        <h5 className="font-bold text-neutral-800 dark:text-neutral-100 truncate text-[11px]">{rec.name}</h5>
                        <p className="text-[10px] text-neutral-400">{rec.pack}</p>
                        <span className="font-extrabold text-neutral-900 dark:text-white text-[11px]">₹{rec.price}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => incrementCart(rec.name)}
                      className="px-2.5 py-1 text-[11px] font-bold text-primary border border-primary/50 hover:bg-primary hover:text-white rounded-lg transition-colors shrink-0"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Extra 10% Off Banner Card * /}
            <div className="bg-gradient-to-br from-emerald-50 dark:from-emerald-900/30 to-teal-50 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    SPECIAL OFFER
                  </span>
                  <h4 className="font-black text-sm text-neutral-900 dark:text-white">Extra 10% Off</h4>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400">On all your wishlist items</p>
                </div>
                <div className="text-3xl">🎁</div>
              </div>

              <div className="p-2 bg-white/80 dark:bg-neutral-900/80 border border-emerald-300 dark:border-emerald-700/50 rounded-xl text-center font-mono font-extrabold text-primary dark:text-emerald-400 text-xs">
                Use Code: WISHLIST10
              </div>
            </div>

            {/* Price Drop Alert Card * /}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-primary dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Bell size={20} />
              </div>
              <div className="space-y-1">
                <h5 className="font-extrabold text-neutral-900 dark:text-white text-xs">Price Drop Alert</h5>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  We'll notify you when prices drop on items in your wishlist.
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

*/
