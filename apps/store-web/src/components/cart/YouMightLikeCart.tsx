"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Heart } from "lucide-react";
import { useStore } from "@/store/useStore";

export const YouMightLikeCart = () => {
  const { incrementCart } = useStore();

  const items = [
    { name: "Tata Salt Iodised", pack: "1 kg", price: 20, icon: "🧂" },
    { name: "Red Label Black Tea", pack: "250 g", price: 182, icon: "☕" },
    { name: "Maggi 2-Minute Noodles", pack: "280 g", price: 24, icon: "🍜" },
    { name: "Sugar - Sulphur Free", pack: "1 kg", price: 45, icon: "🍬" },
    { name: "Dettol Antiseptic Liquid", pack: "550 ml", price: 193, icon: "🧴" },
  ];

  return (
    <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-neutral-900 dark:text-white text-base">You might also like</h3>
        <Link href="/search" className="text-xs font-semibold text-primary flex items-center gap-0.5 hover:underline">
          View All <ChevronRight size={14} />
        </Link>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="min-w-[160px] max-w-[160px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-3 hover:shadow-md transition-shadow relative flex flex-col justify-between group"
            >
              <button className="absolute top-2.5 right-2.5 text-neutral-400 hover:text-danger z-10">
                <Heart size={14} />
              </button>

              <div className="w-full h-24 bg-neutral-50 dark:bg-neutral-950 rounded-xl flex items-center justify-center text-3xl mb-2">
                {item.icon}
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {item.name}
                </h4>
                <p className="text-[11px] text-neutral-400">{item.pack}</p>
              </div>

              <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span className="font-bold text-xs text-neutral-900 dark:text-white">₹{item.price}</span>
                <button
                  onClick={() => incrementCart(item.name)}
                  className="px-2.5 py-1 text-xs font-bold text-primary border border-primary/50 hover:bg-primary hover:text-white rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
