"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown, Heart, User, ShoppingCart, Percent, Smartphone, Truck, HelpCircle, Store, Moon, Sun } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { useLocationStore } from "@/stores/location.store";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { useUIStore } from "@/stores/ui.store";

import { LocationModal } from "./LocationModal";
import { CartToast } from "../shared/CartToast";

export const Header = () => {
  const { city, address, openModal } = useLocationStore();
  const { isAuthenticated, user, openAuthModal } = useAuthStore();
  const { cartCount, isCartBouncing } = useCartStore();
  const { isDarkMode, toggleDarkMode, setDarkMode } = useUIStore();
  const router = useRouter();
  const [query, setQuery] = useState("");

  React.useEffect(() => {
    // Sync dark mode from localStorage on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
    }
  }, [setDarkMode]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  // City from reverse geocode; fall back to first part of the street address; then generic prompt
  const displayLocation = city || (address ? address.split(',')[0].trim() : '') || 'Select Location';
  // Pill inside search bar — truncated to 90px, show city > address-part > 'Select'
  const pillLabel = city || (address ? address.split(',')[0].trim() : '') || 'Select';

  return (
    <header className="w-full bg-surface dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      {/* Top Strip */}
      <div className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 py-1.5 px-4 md:px-8 text-xs text-neutral-600 dark:text-neutral-400 flex justify-between items-center hidden md:flex">
        <div
          onClick={() => openModal()}
          className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
        >
          <MapPin size={14} className="text-primary" />
          <span>Delivering to: <span className="font-medium text-neutral-800 dark:text-neutral-100">{displayLocation}</span></span>
          <span className="text-primary font-semibold text-[11px] underline ml-1">Change</span>
        </div>
        {/* Top Header links removed */}
      </div>

      {/* Main Header */}
      <div className="py-4 px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 cursor-pointer">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
            G
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary leading-none">{BRAND_CONFIG.name}</h1>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">{BRAND_CONFIG.tagline}</p>
          </div>
        </Link>

        {/* Search Bar with integrated Location Selector */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex items-center border border-neutral-300 dark:border-neutral-700 rounded-md overflow-hidden bg-neutral-50 dark:bg-neutral-950 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          {/* Location selector pill inside search bar */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => openModal()}
            className="flex items-center gap-1 px-3 py-2.5 text-sm font-bold text-neutral-700 dark:text-neutral-300 border-r border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 whitespace-nowrap"
          >
            <MapPin size={15} className="text-primary" />
            <span className="truncate max-w-[90px]">{pillLabel}</span>
            <ChevronDown size={13} className="text-neutral-400" />
          </button>
          <input
            suppressHydrationWarning
            type="text"
            placeholder="Search products, shops & categories"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-2.5 px-3 bg-transparent outline-none text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
          />
          <button suppressHydrationWarning type="submit" className="bg-primary text-white px-6 py-2.5 font-medium hover:bg-primary-dark transition-colors shrink-0">
            Search
          </button>
        </form>

        {/* Action Icons */}
        <div className="flex items-center gap-6">
          <button suppressHydrationWarning onClick={toggleDarkMode} className="flex flex-col items-center gap-1 cursor-pointer group">
            {isDarkMode ? (
              <Sun size={20} className="text-neutral-700 dark:text-neutral-300 group-hover:text-amber-500 transition-colors" />
            ) : (
              <Moon size={20} className="text-neutral-700 dark:text-neutral-300 group-hover:text-primary transition-colors" />
            )}
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary">Theme</span>
          </button>
          {/* 
          <Link href="/offers" className="flex flex-col items-center gap-1 cursor-pointer group hidden md:flex">
            <Percent size={20} className="text-neutral-700 dark:text-neutral-300 group-hover:text-primary transition-colors" />
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary">Offers</span>
          </Link>
          <Link href="/account/wishlist" className="flex flex-col items-center gap-1 cursor-pointer group">
            <Heart size={20} className="text-neutral-700 dark:text-neutral-300 group-hover:text-primary transition-colors" />
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary">Wishlist</span>
          </Link> 
          */}

          {/* Account — shows user avatar if authenticated */}
          {isAuthenticated && user ? (
            <Link href="/account" className="flex flex-col items-center gap-1 cursor-pointer group">
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-black">
                {(user.name ?? user.phoneNumber ?? '?').charAt(0).toUpperCase()}
              </div>
              <span className="text-[11px] font-medium text-primary group-hover:underline max-w-[56px] truncate">
                {user.name ?? 'Account'}
              </span>
            </Link>
          ) : (
            <button suppressHydrationWarning onClick={() => openAuthModal()} className="flex flex-col items-center gap-1 cursor-pointer group">
              <User size={20} className="text-neutral-700 dark:text-neutral-300 group-hover:text-primary transition-colors" />
              <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary">Account</span>
            </button>
          )}

          <Link href="/cart" className="flex flex-col items-center gap-1 cursor-pointer group relative">
            <div className={`relative transition-transform duration-300 ${isCartBouncing ? "scale-125 -translate-y-1" : ""}`}>
              <ShoppingCart size={20} className={`text-neutral-700 dark:text-neutral-300 group-hover:text-primary transition-colors ${isCartBouncing ? "text-primary" : ""}`} />
              {cartCount > 0 && (
                <span className={`absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white transition-all ${isCartBouncing ? "scale-125 bg-emerald-600" : ""}`}>
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary">Cart</span>
          </Link>
        </div>
      </div>

      {/* Mobile Search (visible only on small screens) */}
      <div className="px-4 pb-4 md:hidden">
        <form onSubmit={handleSearch} className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-md overflow-hidden bg-neutral-50 dark:bg-neutral-950">
          <div className="pl-3 text-neutral-400">
            <Search size={18} />
          </div>
          <input
            suppressHydrationWarning
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-2 px-3 bg-transparent outline-none text-sm text-neutral-800 dark:text-neutral-100 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
        </form>
      </div>

      {/* Location Selector Modal */}
      <LocationModal />

      {/* Toast Notification */}
      <CartToast />
    </header>
  );
};
