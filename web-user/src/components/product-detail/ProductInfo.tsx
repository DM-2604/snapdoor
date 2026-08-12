"use client";

import React, { useState } from "react";
import { Star, ChevronRight, Truck, RefreshCcw, ShieldCheck, Plus, Minus, ShoppingCart, Zap } from "lucide-react";
import { useStore } from "@/store/useStore";

export const ProductInfo = () => {
  const { incrementCart } = useStore();
  const [selectedSize, setSelectedSize] = useState("5kg");
  const [quantity, setQuantity] = useState(1);

  const sizes = [
    { label: "1 kg", price: 56, unitPrice: "₹56/kg" },
    { label: "5 kg", price: 265, unitPrice: "₹53/kg" },
    { label: "10 kg", price: 510, unitPrice: "₹51/kg" },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Ratings */}
      <div className="space-y-2">
        <span className="bg-primary-subtle text-primary-dark font-bold text-xs px-2.5 py-1 rounded-md">
          Best Seller
        </span>

        <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white leading-tight pt-1">
          Aashirvaad Whole Wheat Atta
        </h1>

        <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-warning fill-warning" />
            <span className="font-bold text-neutral-800 dark:text-neutral-100">4.6</span>
            <span className="text-neutral-400">(12.5K Ratings)</span>
          </div>
          <span className="text-neutral-300">•</span>
          <span className="font-medium text-neutral-700 dark:text-neutral-300">5K+ sold this month</span>
        </div>

        {/* Sold By Info */}
        <div className="flex items-center gap-1.5 text-xs pt-1">
          <span className="text-neutral-500 dark:text-neutral-400">Sold by:</span>
          <span className="font-bold text-neutral-800 dark:text-neutral-100">Gupta Kirana Store</span>
          <div className="flex items-center gap-0.5 text-warning font-bold">
            <Star size={12} className="fill-warning" />
            <span>4.8</span>
          </div>
          <span className="text-neutral-400">(2.1K Reviews)</span>
          <ChevronRight size={14} className="text-neutral-400 cursor-pointer" />
        </div>
      </div>

      {/* Price Section */}
      <div className="space-y-1 bg-neutral-50 dark:bg-neutral-950/70 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800/60">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-neutral-900 dark:text-white">₹265</span>
          <span className="text-base text-neutral-400 line-through">₹300</span>
          <span className="text-xs font-bold text-success bg-success-subtle px-2 py-0.5 rounded-md">
            12% OFF
          </span>
        </div>
        <p className="text-[11px] text-neutral-400">
          (₹53 / kg) <span className="text-neutral-500 dark:text-neutral-400">• Inclusive of all taxes</span>
        </p>
      </div>

      {/* Available Offers */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-neutral-800 dark:text-neutral-100">Available Offers</label>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-lg">
            <span className="text-primary font-bold">🏷️</span>
            <div className="flex-1 text-neutral-700 dark:text-neutral-300">
              <strong className="text-neutral-900 dark:text-white">10% Instant Discount</strong> on orders above ₹999
            </div>
            <span className="text-[11px] font-bold text-primary cursor-pointer hover:underline">T&C</span>
          </div>
          <div className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-lg">
            <span className="text-primary font-bold">💳</span>
            <div className="flex-1 text-neutral-700 dark:text-neutral-300">
              <strong className="text-neutral-900 dark:text-white">Bank Offer 5%</strong> Unlimited Cashback on SBI Cards
            </div>
            <span className="text-[11px] font-bold text-primary cursor-pointer hover:underline">T&C</span>
          </div>
          <div className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-lg">
            <span className="text-primary font-bold">🚚</span>
            <div className="flex-1 text-neutral-700 dark:text-neutral-300">
              <strong className="text-neutral-900 dark:text-white">Free Delivery</strong> on orders above ₹499
            </div>
            <span className="text-[11px] font-bold text-primary cursor-pointer hover:underline">T&C</span>
          </div>
          <button className="text-xs font-semibold text-primary hover:underline pt-0.5">
            + 2 more offers
          </button>
        </div>
      </div>

      {/* Select Size / Variant */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-neutral-800 dark:text-neutral-100">Select Size</label>
        <div className="grid grid-cols-3 gap-3">
          {sizes.map((s) => {
            const isSelected = selectedSize === s.label.replace(" ", "");
            return (
              <button
                key={s.label}
                onClick={() => setSelectedSize(s.label.replace(" ", ""))}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "border-primary bg-primary-subtle/30 text-primary shadow-xs"
                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                <div className="font-bold text-xs">{s.label}</div>
                <div className="text-[11px] font-semibold text-neutral-900 dark:text-white mt-0.5">
                  ₹{s.price} <span className="text-neutral-400 font-normal">({s.unitPrice})</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity & CTA Buttons */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-4">
          <label className="text-xs font-bold text-neutral-800 dark:text-neutral-100">Quantity</label>
          <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-950">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/80 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="px-4 font-bold text-xs text-neutral-800 dark:text-neutral-100">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/80 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="text-xs text-neutral-400">({selectedSize})</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => incrementCart()}
            className="py-3.5 px-4 border-2 border-primary text-primary font-bold text-sm rounded-xl hover:bg-primary-subtle transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            <span>Add to Cart</span>
          </button>
          <button className="py-3.5 px-4 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
            <Zap size={18} />
            <span>Buy Now</span>
          </button>
        </div>
      </div>

      {/* Delivery & Service Strip */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs">
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <Truck size={18} className="text-primary shrink-0" />
          <div>
            <div className="font-bold text-neutral-800 dark:text-neutral-100">Delivery</div>
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Today, 10:00 AM - 12:00 PM</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <RefreshCcw size={18} className="text-warning shrink-0" />
          <div>
            <div className="font-bold text-neutral-800 dark:text-neutral-100">Easy Returns</div>
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Hassle free returns</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <ShieldCheck size={18} className="text-success shrink-0" />
          <div>
            <div className="font-bold text-neutral-800 dark:text-neutral-100">Secure Payment</div>
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400">100% secure payments</div>
          </div>
        </div>
      </div>
    </div>
  );
};
