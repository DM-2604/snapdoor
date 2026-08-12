"use client";

import React, { useState } from "react";
import { Clock, X, ChevronRight } from "lucide-react";
import { useStore } from "@/store/useStore";

export const RightSidebar = () => {
  const { incrementCart } = useStore();
  const [recentSearches, setRecentSearches] = useState([
    "milk",
    "bread",
    "paracetamol",
    "notebook",
    "amul butter",
  ]);

  const recommendations = [
    { name: "Eggs - Farm Fresh", price: 60, pack: "12 pcs", icon: "🥚" },
    { name: "Bread - Brown", price: 38, pack: "400g", icon: "🍞" },
    { name: "Amul Butter", price: 55, pack: "100g", icon: "🧈" },
    { name: "Cheese Slice", price: 80, pack: "200g", icon: "🧀" },
  ];

  const removeSearch = (item: string) => {
    setRecentSearches(recentSearches.filter((s) => s !== item));
  };

  return (
    <aside className="w-full space-y-6 text-sm">
      {/* Recent Searches Card */}
      <div className="bg-neutral-50 dark:bg-neutral-950/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-neutral-800 dark:text-neutral-100 text-xs">Recent Searches</h4>
          {recentSearches.length > 0 && (
            <button
              onClick={() => setRecentSearches([])}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {recentSearches.length === 0 ? (
          <p className="text-xs text-neutral-400 italic">No recent searches</p>
        ) : (
          <div className="space-y-2">
            {recentSearches.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-white group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-neutral-400 group-hover:text-primary transition-colors" />
                  <span className="capitalize">{item}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSearch(item);
                  }}
                  className="text-neutral-400 hover:text-danger p-0.5 rounded transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* You Might Also Like Card */}
      <div className="bg-neutral-50 dark:bg-neutral-950/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800/80 space-y-4">
        <h4 className="font-bold text-neutral-800 dark:text-neutral-100 text-xs">You Might Also Like</h4>

        <div className="space-y-3">
          {recommendations.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800/70 hover:shadow-sm transition-shadow"
            >
              <div className="w-10 h-10 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-lg shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-xs text-neutral-800 dark:text-neutral-100 truncate">{item.name}</h5>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">₹{item.price} <span className="text-neutral-400 font-normal">/ {item.pack}</span></p>
              </div>
              <button
                onClick={() => incrementCart(item.name)}
                className="text-[11px] font-bold text-primary hover:bg-primary-subtle px-2 py-1 rounded border border-primary/40 transition-colors"
              >
                Add
              </button>
            </div>
          ))}
        </div>

        <button className="w-full py-2 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 text-center transition-colors flex items-center justify-center gap-1">
          <span>View More</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </aside>
  );
};
