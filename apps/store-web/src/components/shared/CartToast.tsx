"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import Link from "next/link";

export const CartToast = () => {
  const { toastMessage, clearToast } = useCartStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toastMessage) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(clearToast, 300); // Wait for exit animation
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-neutral-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-700 w-80 transition-all duration-300 ${
        isVisible ? "animate-toast-enter opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div className="text-sm">
            <p className="font-extrabold">{toastMessage}</p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-neutral-400 hover:text-white p-1 ml-2 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-4 pb-4 flex justify-end">
        <Link
          href="/cart"
          onClick={() => setIsVisible(false)}
          className="px-4 py-1.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs font-bold rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
        >
          <ShoppingBag size={14} /> View Cart
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-neutral-800 w-full">
        <div className="h-full bg-primary animate-progress origin-left" />
      </div>
    </div>
  );
};
