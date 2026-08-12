"use client";

import React from "react";
import { ShieldCheck, Truck, RefreshCcw, Headphones } from "lucide-react";

export const AssuranceBanner = () => {
  return (
    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-6 my-8 grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
          <Truck size={22} />
        </div>
        <div>
          <h4 className="font-bold text-xs text-neutral-900 dark:text-white">20 Mins Delivery</h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Superfast local dispatch</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h4 className="font-bold text-xs text-neutral-900 dark:text-white">100% Quality Check</h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Fresh products guaranteed</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
          <RefreshCcw size={22} />
        </div>
        <div>
          <h4 className="font-bold text-xs text-neutral-900 dark:text-white">Instant Refund</h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Hassle free return policy</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
          <Headphones size={22} />
        </div>
        <div>
          <h4 className="font-bold text-xs text-neutral-900 dark:text-white">Dedicated Support</h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">24/7 customer care</p>
        </div>
      </div>
    </div>
  );
};
