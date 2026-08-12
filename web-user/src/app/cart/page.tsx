"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import {
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  ShoppingBag,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import { useStore } from "@/store/useStore";

export default function CartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeItem, toggleSelect, toggleSelectAll, removeSelected, incrementCart } = useStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const selectedItems = cartItems.filter((i) => i.selected);
  const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

  const subtotal = selectedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const discount = couponApplied ? 100 : 81;
  const deliveryCharges = subtotal >= 499 ? 0 : 40;
  const freeDeliveryThreshold = 499;
  const progressPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);
  const amountNeeded = Math.max(0, freeDeliveryThreshold - subtotal);
  const platformFee = 10;
  const totalAmount = Math.max(0, subtotal - discount + deliveryCharges + platformFee);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-white font-bold">Shopping Cart</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 space-y-6">
        
        {/* Free Delivery Progress Banner */}
        <div className="bg-white dark:bg-neutral-900 border border-emerald-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white text-xs">
              <Truck size={18} className="text-primary" />
              {amountNeeded > 0 ? (
                <span>
                  Add <strong className="text-primary font-black">₹{amountNeeded}</strong> more to get <strong className="text-emerald-700 font-black">FREE Delivery!</strong>
                </span>
              ) : (
                <span className="text-emerald-700 font-black flex items-center gap-1">
                  🎉 Congratulations! You unlocked FREE Delivery!
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">{subtotal}/₹{freeDeliveryThreshold}</span>
          </div>

          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Cart Items Column */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Header controls */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 shadow-xs flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="rounded accent-primary cursor-pointer w-4 h-4 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                />
                <span className="text-neutral-800 dark:text-neutral-100">Select All ({cartItems.length} Items)</span>
              </div>

              {selectedItems.length > 0 && (
                <button
                  onClick={removeSelected}
                  className="text-danger hover:underline flex items-center gap-1 font-bold"
                >
                  <Trash2 size={14} />
                  <span>Remove Selected ({selectedItems.length})</span>
                </button>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelect(item.id)}
                      className="rounded accent-primary cursor-pointer w-4 h-4 shrink-0 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />

                    <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-950 rounded-xl flex items-center justify-center text-3xl shrink-0">
                      {item.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">{item.name}</h4>
                        {item.bestSeller && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.2 rounded">
                            BEST SELLER
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{item.pack} • <strong className="text-neutral-700 dark:text-neutral-300">{item.store}</strong></p>
                      <p className="text-[10px] text-emerald-600 font-semibold">{item.deliveryTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-neutral-100 dark:border-neutral-800">
                    <div className="text-right">
                      <span className="font-black text-sm text-neutral-900 dark:text-white block">₹{item.price * item.quantity}</span>
                      <span className="text-[10px] text-neutral-400 line-through">₹{item.originalPrice * item.quantity}</span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-neutral-900 shadow-2xs hover:bg-neutral-200 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-bold"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-extrabold text-neutral-900 dark:text-white w-4 text-center text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-neutral-900 shadow-2xs hover:bg-neutral-200 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-bold"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-neutral-400 hover:text-danger p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4 sticky top-24">
              <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm border-b border-neutral-100 dark:border-neutral-800 pb-3">Order Summary</h3>

              <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal ({selectedItems.length} items)</span>
                  <span className="font-bold text-neutral-900 dark:text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>- ₹{discount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-emerald-600">{deliveryCharges === 0 ? "FREE" : `₹${deliveryCharges}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="font-bold text-neutral-900 dark:text-white">₹{platformFee}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 block">Total Amount</span>
                  <span className="text-xl font-black text-neutral-900 dark:text-white">₹{totalAmount}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  ₹{discount} Saved
                </span>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-extrabold text-sm rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium pt-1">
                <ShieldCheck size={14} className="text-primary" />
                <span>100% Safe & Secure Checkout</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
