"use client";

import React from "react";
import { ShieldCheck, Truck, RefreshCw, Lock, Headphones } from "lucide-react";

export const CartAssuranceStrip = () => {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-5 gap-4 items-center text-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
          🛡️
        </div>
        <div>
          <h5 className="font-bold text-neutral-800 dark:text-neutral-100 text-[11px]">Green Mart Assurance</h5>
          <p className="text-[10px] text-neutral-400">Safe shopping & easy returns</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
          🚚
        </div>
        <div>
          <h5 className="font-bold text-neutral-800 dark:text-neutral-100 text-[11px]">On-time Delivery</h5>
          <p className="text-[10px] text-neutral-400">Or we make it right</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
          🔄
        </div>
        <div>
          <h5 className="font-bold text-neutral-800 dark:text-neutral-100 text-[11px]">Refundable</h5>
          <p className="text-[10px] text-neutral-400">Easy returns & refunds</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
          🔒
        </div>
        <div>
          <h5 className="font-bold text-neutral-800 dark:text-neutral-100 text-[11px]">Secure Payments</h5>
          <p className="text-[10px] text-neutral-400">100% protected</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
          🎧
        </div>
        <div>
          <h5 className="font-bold text-neutral-800 dark:text-neutral-100 text-[11px]">24/7 Support</h5>
          <p className="text-[10px] text-neutral-400">We are here to help</p>
        </div>
      </div>
    </div>
  );
};
