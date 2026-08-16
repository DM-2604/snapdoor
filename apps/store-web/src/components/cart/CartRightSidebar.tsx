"use client";

import React, { useState } from "react";
import { Tag, ShieldCheck, ChevronDown, Check, MapPin, Truck, RefreshCw, Lock } from "lucide-react";
import { useStore } from "@/store/useStore";

export const CartRightSidebar = () => {
  const { cartItems, location, setIsLocationModalOpen } = useStore();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>("WELCOME10");

  const selectedItems = cartItems.filter((i) => i.selected);
  const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemDiscounts = 81; // Demo discount
  const deliveryCharge = subtotal > 499 ? 0 : 40;
  const platformFee = 10;
  const grandTotal = Math.max(0, subtotal - (appliedCoupon ? 50 : 0) + platformFee);

  return (
    <aside className="space-y-5 text-xs">
      {/* Apply Offers Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 p-4 rounded-2xl space-y-3 shadow-xs">
        <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Apply Offers</h4>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none focus:border-primary uppercase font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
          <button
            onClick={() => setAppliedCoupon(couponCode || "WELCOME10")}
            className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors"
          >
            Apply
          </button>
        </div>

        {/* Applied / Available Coupon Tag */}
        <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
          <div className="flex items-center gap-2">
            <Tag size={15} className="text-primary" />
            <div>
              <span className="font-extrabold text-neutral-900 dark:text-white text-xs">WELCOME10</span>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">10% OFF up to ₹100</p>
            </div>
          </div>
          <button
            onClick={() => setAppliedCoupon(appliedCoupon ? null : "WELCOME10")}
            className="text-xs font-bold text-primary hover:underline"
          >
            {appliedCoupon === "WELCOME10" ? "Remove" : "Apply"}
          </button>
        </div>

        <button className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 flex items-center justify-between w-full pt-1">
          <span>More Offers</span>
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Order Summary Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 p-4 sm:p-5 rounded-2xl space-y-4 shadow-xs">
        <h4 className="font-bold text-neutral-900 dark:text-white text-xs uppercase tracking-wider">Order Summary</h4>

        <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex justify-between">
            <span>Subtotal ({selectedItems.length} Items)</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-success">
            <span>Item Discounts</span>
            <span className="font-semibold">-₹{itemDiscounts}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Charges</span>
            <span className="font-semibold">
              <span className="line-through text-neutral-400 mr-1">₹40</span>
              <span className="text-success font-bold">FREE</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span>Platform Fee</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">₹{platformFee}</span>
          </div>
        </div>

        {/* Total Amount */}
        <div className="space-y-1">
          <div className="flex justify-between items-baseline">
            <span className="font-bold text-neutral-900 dark:text-white text-sm">Total Amount</span>
            <span className="font-extrabold text-neutral-900 dark:text-white text-xl">₹{grandTotal}</span>
          </div>
          <p className="text-[11px] font-bold text-success text-right">
            You Save ₹121 on this order
          </p>
        </div>

        {/* Checkout CTA */}
        <div className="space-y-2 pt-1">
          <button className="w-full py-3.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
            <span>Proceed to Checkout</span>
            <ChevronDown size={16} className="-rotate-90" />
          </button>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 font-medium">
            <Lock size={12} className="text-neutral-500 dark:text-neutral-400" />
            <span>100% Secure Payments</span>
          </div>
        </div>
      </div>

      {/* Delivery Address Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 p-4 rounded-2xl space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Delivering to</span>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Change
          </button>
        </div>

        <div className="flex items-start gap-2 pt-1">
          <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-neutral-900 dark:text-white text-xs truncate">{location}</h5>
            <p className="text-[10px] text-neutral-400">Home - 2nd Floor, Near Metro Gate No. 4</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">Delivery in 20-30 min</p>
          </div>
        </div>
      </div>

      {/* Why shop from Green Mart */}
      <div className="bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800/80 p-4 rounded-2xl space-y-3">
        <h4 className="font-bold text-neutral-800 dark:text-neutral-100 text-xs">Why shop from Green Mart?</h4>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800/60 space-y-1">
            <div className="text-primary text-base font-bold">🏷️</div>
            <div className="font-bold text-neutral-800 dark:text-neutral-100 text-[11px]">Best Prices</div>
            <div className="text-[9px] text-neutral-400">Guaranteed</div>
          </div>
          <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800/60 space-y-1">
            <div className="text-primary text-base font-bold">⚡</div>
            <div className="font-bold text-neutral-800 dark:text-neutral-100 text-[11px]">Fast Delivery</div>
            <div className="text-[9px] text-neutral-400">In 20-30 min</div>
          </div>
          <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800/60 space-y-1">
            <div className="text-primary text-base font-bold">🔄</div>
            <div className="font-bold text-neutral-800 dark:text-neutral-100 text-[11px]">Easy Returns</div>
            <div className="text-[9px] text-neutral-400">Hassle Free</div>
          </div>
          <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800/60 space-y-1">
            <div className="text-primary text-base font-bold">🛡️</div>
            <div className="font-bold text-neutral-800 dark:text-neutral-100 text-[11px]">Secure Payment</div>
            <div className="text-[9px] text-neutral-400">100% Safe</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
