"use client";

import React from "react";
import { Star, MapPin, Store, Clock, Zap } from "lucide-react";
import { useStore } from "@/store/useStore";

export const RightSidebarDetail = () => {
  const { location, setIsLocationModalOpen, incrementCart } = useStore();

  const crossSells = [
    { name: "Tata Salt Iodised", pack: "1 kg", price: 20, icon: "🧂" },
    { name: "Fortune Sunlite Oil", pack: "1 L", price: 145, icon: "🌻" },
    { name: "Good Life Toor Dal", pack: "1 kg", price: 110, icon: "🫘" },
    { name: "Red Label Tea", pack: "250 g", price: 182, icon: "☕" },
  ];

  return (
    <aside className="space-y-5 text-xs">
      {/* Seller Card */}
      <div className="bg-neutral-50 dark:bg-neutral-950/70 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
              <Store size={18} />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-medium">Sold by</p>
              <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Gupta Kirana Store</h4>
              <div className="flex items-center gap-1 text-[10px] text-neutral-600 dark:text-neutral-400">
                <Star size={10} className="text-warning fill-warning" />
                <span className="font-bold">4.8</span>
                <span className="text-neutral-400">(2.1K Reviews)</span>
              </div>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-primary border border-primary/40 font-bold rounded-lg transition-colors">
            View Shop
          </button>
        </div>
      </div>

      {/* Delivery Address Box */}
      <div className="bg-neutral-50 dark:bg-neutral-950/70 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Delivering to</span>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Change
          </button>
        </div>
        <p className="font-semibold text-neutral-800 dark:text-neutral-100 text-xs truncate">{location}</p>

        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
          <Clock size={12} className="text-neutral-400" />
          <span>Delivery in 20-30 min</span>
        </div>

        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary-subtle px-2 py-0.5 rounded">
          <Zap size={11} />
          <span>Express Delivery</span>
        </div>
      </div>

      {/* You Might Also Need */}
      <div className="bg-neutral-50 dark:bg-neutral-950/70 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800/80 space-y-3">
        <h4 className="font-bold text-neutral-900 dark:text-white text-xs">You might also need</h4>

        <div className="space-y-2.5">
          {crossSells.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800/70 hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg">{item.icon}</span>
                <div className="truncate">
                  <h5 className="font-bold text-xs text-neutral-800 dark:text-neutral-100 truncate">{item.name}</h5>
                  <p className="text-[10px] text-neutral-400">{item.pack}</p>
                  <p className="font-bold text-xs text-neutral-900 dark:text-white">₹{item.price}</p>
                </div>
              </div>
              <button
                onClick={() => incrementCart(item.name)}
                className="px-2.5 py-1 text-[11px] font-bold text-primary border border-primary/40 hover:bg-primary hover:text-white rounded-md transition-colors shrink-0"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
