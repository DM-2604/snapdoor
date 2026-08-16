"use client";

import React from "react";
import { Trash2, Bookmark, Plus, Minus, Check } from "lucide-react";
import { useStore } from "@/store/useStore";
import Link from "next/link";

export const CartItemList = () => {
  const {
    cartItems,
    updateQuantity,
    removeItem,
    toggleSelect,
    toggleSelectAll,
    removeSelected,
  } = useStore();

  const allSelected = cartItems.length > 0 && cartItems.every((i) => i.selected);
  const selectedCount = cartItems.filter((i) => i.selected).length;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Table Header */}
      <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider items-center">
        <div className="col-span-6 flex items-center gap-3">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => toggleSelectAll(e.target.checked)}
            className="w-4 h-4 rounded accent-primary cursor-pointer text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
          <span>Item Details</span>
        </div>
        <div className="col-span-2 text-center">Price</div>
        <div className="col-span-2 text-center">Quantity</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      {/* Cart Items */}
      {cartItems.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="text-4xl">🛒</div>
          <h4 className="font-bold text-neutral-800 dark:text-neutral-100 text-base">Your cart is empty</h4>
          <p className="text-xs text-neutral-400">Explore products and add items to your cart.</p>
          <Link
            href="/search"
            className="inline-block px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center group"
            >
              {/* Item Details */}
              <div className="sm:col-span-6 flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => toggleSelect(item.id)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer mt-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                />
                
                {/* Product Thumbnail */}
                <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800/80 flex items-center justify-center text-3xl shrink-0">
                  {item.icon}
                </div>

                {/* Info */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href="/product/1"
                      className="font-bold text-xs text-neutral-900 dark:text-white hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    {item.bestSeller && (
                      <span className="bg-primary-subtle text-primary-dark font-bold text-[9px] px-1.5 py-0.5 rounded shrink-0">
                        Best Seller
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {item.pack} • <span className="text-neutral-600 dark:text-neutral-400">Sold by {item.store}</span>
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-600">
                    {item.deliveryTime}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="sm:col-span-2 text-left sm:text-center text-xs">
                <div className="font-bold text-neutral-900 dark:text-white">₹{item.price}</div>
                <div className="text-[10px] text-neutral-400 line-through">₹{item.originalPrice}</div>
                <div className="text-[10px] font-bold text-success">{item.discount}</div>
              </div>

              {/* Quantity */}
              <div className="sm:col-span-2 flex justify-start sm:justify-center">
                <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden bg-neutral-50 dark:bg-neutral-950">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="px-3 text-xs font-bold text-neutral-800 dark:text-neutral-100">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Total & Remove */}
              <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3 text-xs">
                <span className="font-extrabold text-neutral-900 dark:text-white text-sm">
                  ₹{item.price * item.quantity}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-neutral-400 hover:text-danger p-1 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Table Controls */}
      {cartItems.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          <label className="flex items-center gap-2 cursor-pointer hover:text-neutral-900 dark:text-white">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => toggleSelectAll(e.target.checked)}
              className="w-4 h-4 rounded accent-primary cursor-pointer text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            />
            <span>Select All ({cartItems.length})</span>
          </label>

          <div className="flex items-center gap-4">
            <button
              onClick={removeSelected}
              disabled={selectedCount === 0}
              className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 hover:text-danger disabled:opacity-40 transition-colors"
            >
              <Trash2 size={14} />
              <span>Remove Selected</span>
            </button>
            <button className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">
              <Bookmark size={14} />
              <span>Save for Later</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
