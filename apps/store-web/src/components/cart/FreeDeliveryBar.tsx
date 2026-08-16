"use client";

import React from "react";
import { Truck } from "lucide-react";

export const FreeDeliveryBar = () => {
  return (
    <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-xl space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-100">
        <div className="flex items-center gap-1.5 text-primary-dark">
          <span>🎉</span>
          <span>Yay! You are <strong className="text-primary font-bold">₹251</strong> away from FREE delivery</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
          <span>Free Delivery</span>
          <strong className="text-neutral-800 dark:text-neutral-100">₹499</strong>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 bg-neutral-200/80 rounded-full overflow-hidden relative">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500 relative"
          style={{ width: "50%" }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white shadow-xs">
            <Truck size={10} />
          </div>
        </div>
      </div>
    </div>
  );
};
