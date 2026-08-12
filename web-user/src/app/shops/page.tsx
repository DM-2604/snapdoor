"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Store, Star, Clock, MapPin, Search, ChevronRight, Zap, ShieldCheck } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function ShopsPage() {
  const { city, location } = useStore();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", label: "All Shops" },
    { id: "kirana", label: "Kirana & Grocery" },
    { id: "pharmacy", label: "Pharmacy & Health" },
    { id: "dairy", label: "Dairy & Fresh Milk" },
    { id: "supermarket", label: "Supermarket" },
    { id: "stationery", label: "Stationery & Books" },
  ];

  const shopsList = [
    {
      id: "shop-1",
      name: "Gupta Kirana Store",
      category: "kirana",
      categoryName: "Kirana & Grocery",
      rating: 4.8,
      reviews: "2.1K",
      distance: "0.8 km",
      time: "15-20 min",
      minOrder: 100,
      offer: "10% OFF on Orders > ₹499",
      icon: "🏪",
      verified: true,
      itemsCount: "1,200+ Products",
    },
    {
      id: "shop-2",
      name: "HealthPlus Pharmacy",
      category: "pharmacy",
      categoryName: "Pharmacy & Medicines",
      rating: 4.7,
      reviews: "890",
      distance: "1.2 km",
      time: "15-25 min",
      minOrder: 50,
      offer: "15% OFF on Medicines",
      icon: "💊",
      verified: true,
      itemsCount: "850+ Products",
    },
    {
      id: "shop-3",
      name: "Fresh Mart Supermarket",
      category: "supermarket",
      categoryName: "Supermarket",
      rating: 4.6,
      reviews: "3.5K",
      distance: "1.5 km",
      time: "20-30 min",
      minOrder: 250,
      offer: "Buy 1 Get 1 Free on Snacks",
      icon: "🛒",
      verified: true,
      itemsCount: "3,500+ Products",
    },
    {
      id: "shop-4",
      name: "Sharma Dairy & Daily Needs",
      category: "dairy",
      categoryName: "Dairy Store",
      rating: 4.9,
      reviews: "1.4K",
      distance: "0.5 km",
      time: "10-15 min",
      minOrder: 0,
      offer: "Fresh Morning Delivery",
      icon: "🥛",
      verified: true,
      itemsCount: "420+ Products",
    },
    {
      id: "shop-5",
      name: "City Stationers & Xerox",
      category: "stationery",
      categoryName: "Stationery Store",
      rating: 4.5,
      reviews: "450",
      distance: "1.8 km",
      time: "20-30 min",
      minOrder: 100,
      offer: "10% OFF for Students",
      icon: "✏️",
      verified: false,
      itemsCount: "600+ Products",
    },
  ];

  const filteredShops = shopsList.filter((shop) => {
    const matchesCat = selectedCategory === "all" || shop.category === selectedCategory;
    const matchesQuery = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || shop.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-white font-bold">Local Shops</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 space-y-6">
        
        {/* Title Header */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <MapPin size={16} />
              <span>Delivering from verified stores in {city}</span>
            </div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Local Stores Near You</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Order directly from trusted neighborhood kirana, pharmacy, and daily needs shops</p>
          </div>

          <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-950 focus-within:border-primary w-full md:w-80">
            <div className="pl-3 text-neutral-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search local shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 px-3 bg-transparent outline-none text-xs text-neutral-800 dark:text-neutral-100 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                selectedCategory === cat.id
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Shops Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShops.map((shop) => (
            <div key={shop.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl shrink-0">
                      {shop.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">{shop.name}</h3>
                        {shop.verified && <ShieldCheck size={14} className="text-primary fill-primary/10" />}
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">{shop.categoryName} • {shop.itemsCount}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-neutral-800 dark:text-neutral-100 font-extrabold text-xs">
                    <Star size={12} className="text-warning fill-warning" />
                    <span>{shop.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-1 font-bold text-neutral-800 dark:text-neutral-100">
                    <Clock size={13} className="text-primary" />
                    <span>{shop.time}</span>
                  </div>
                  <span>Min Order: ₹{shop.minOrder}</span>
                  <span className="text-neutral-400">{shop.distance} away</span>
                </div>

                {shop.offer && (
                  <div className="bg-emerald-50/80 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                    <Zap size={11} className="text-primary" />
                    <span>{shop.offer}</span>
                  </div>
                )}
              </div>

              <Link
                href="/search"
                className="w-full py-2.5 bg-neutral-50 dark:bg-neutral-950 hover:bg-primary hover:text-white border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 font-bold rounded-xl text-center transition-all block text-xs"
              >
                Visit Store Products
              </Link>
            </div>
          ))}
        </div>

      </div>

      <Footer />
    </main>
  );
}
