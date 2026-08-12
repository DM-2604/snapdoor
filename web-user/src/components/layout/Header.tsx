"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown, Heart, User, ShoppingCart, Percent, Smartphone, Truck, HelpCircle, Store, Moon, Sun } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { useStore } from "@/store/useStore";

import { LocationModal } from "./LocationModal";
import { CartToast } from "../shared/CartToast";

export const Header = () => {
  const { city, location, cartCount, setIsLocationModalOpen, isCartBouncing, isDarkMode, toggleDarkMode, setDarkMode } = useStore();
  const router = useRouter();
  const [query, setQuery] = useState("");

  React.useEffect(() => {
    // Check local storage for theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
    }
  }, [setDarkMode]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="w-full bg-surface dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      {/* Top Strip */}
      <div className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 py-1.5 px-4 md:px-8 text-xs text-neutral-600 dark:text-neutral-400 flex justify-between items-center hidden md:flex">
        <div 
          onClick={() => setIsLocationModalOpen(true)}
          className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
        >
          <MapPin size={14} className="text-primary" />
          <span>Delivering to: <span className="font-medium text-neutral-800 dark:text-neutral-100">{location}</span></span>
          <span className="text-primary font-semibold text-[11px] underline ml-1">Change</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1 hover:text-primary"><Smartphone size={14} /> Download App</Link>
          <Link href="/account/orders/GM1234567890/track" className="flex items-center gap-1 hover:text-primary"><Truck size={14} /> Track Order</Link>
          <Link href="/support" className="flex items-center gap-1 hover:text-primary"><HelpCircle size={14} /> Help &amp; Support</Link>
          <Link href="/sell" className="flex items-center gap-1 text-primary font-medium hover:underline"><Store size={14} /> Sell on {BRAND_CONFIG.name}</Link>
        </div>
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
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1 px-3 py-2.5 text-sm font-bold text-neutral-700 dark:text-neutral-300 border-r border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 whitespace-nowrap"
          >
            <MapPin size={15} className="text-primary" />
            <span className="truncate max-w-[90px]">{city}</span>
            <ChevronDown size={13} className="text-neutral-400" />
          </button>
          <input 
            type="text" 
            placeholder="Search products, shops & categories" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-2.5 px-3 bg-transparent outline-none text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
          />
          <button type="submit" className="bg-primary text-white px-6 py-2.5 font-medium hover:bg-primary-dark transition-colors shrink-0">
            Search
          </button>
        </form>

        {/* Action Icons */}
        <div className="flex items-center gap-6">
          <button onClick={toggleDarkMode} className="flex flex-col items-center gap-1 cursor-pointer group">
            {isDarkMode ? (
              <Sun size={20} className="text-neutral-700 dark:text-neutral-300 group-hover:text-amber-500 transition-colors" />
            ) : (
              <Moon size={20} className="text-neutral-700 dark:text-neutral-300 group-hover:text-primary transition-colors" />
            )}
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary">Theme</span>
          </button>
          <Link href="/offers" className="flex flex-col items-center gap-1 cursor-pointer group hidden md:flex">
            <Percent size={20} className="text-neutral-700 dark:text-neutral-300 group-hover:text-primary transition-colors" />
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary">Offers</span>
          </Link>
          <Link href="/account/wishlist" className="flex flex-col items-center gap-1 cursor-pointer group">
            <Heart size={20} className="text-neutral-700 dark:text-neutral-300 group-hover:text-primary transition-colors" />
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary">Wishlist</span>
          </Link>
          <Link href="/account" className="flex flex-col items-center gap-1 cursor-pointer group">
            <User size={20} className="text-neutral-700 dark:text-neutral-300 group-hover:text-primary transition-colors" />
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary">Account</span>
          </Link>
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
