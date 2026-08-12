"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { HeroBanner } from "@/components/home/HeroBanner";
import { UspBar } from "@/components/home/UspBar";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { StoreCarousel } from "@/components/home/StoreCarousel";
import { ProductCarousel, Product } from "@/components/home/ProductCarousel";
import { PromoBanners } from "@/components/home/PromoBanners";

export default function Home() {
  
  // Dummy Data
  const popularProducts: Product[] = [
    { id: 1, emoji: "🌻", name: "Fortune Sunlite Refined Sunflower Oil (1L)", store: "Gupta Kirana Store", rating: 4.5, price: 145, originalPrice: 160 },
    { id: 2, emoji: "🌾", name: "Aashirvaad Atta (5kg)", store: "Gupta Kirana Store", rating: 4.6, price: 248, originalPrice: 280 },
    { id: 3, emoji: "🥛", name: "Amul Gold Milk (1L)", store: "Kwality Dairy", rating: 4.8, price: 63, originalPrice: 66 },
    { id: 4, emoji: "🧴", name: "Dettol Antiseptic Liquid (250ml)", store: "Apollo Pharmacy", rating: 4.7, price: 193, originalPrice: 215 },
    { id: 5, emoji: "🍪", name: "Parle-G Biscuits (800g)", store: "Gupta Kirana Store", rating: 4.5, price: 70, originalPrice: 85 },
    { id: 6, emoji: "💧", name: "Nivea Soft Cream (200ml)", store: "Beauty Care Store", rating: 4.4, price: 110, originalPrice: 130 },
  ];

  const flashDeals: Product[] = [
    { id: 7, emoji: "🫧", name: "Surf Excel Matic (1kg)", store: "Gupta Kirana Store", rating: 4.6, price: 359, originalPrice: 500, discount: "40% OFF" },
    { id: 8, emoji: "🦷", name: "Colgate MaxFresh (150g)", store: "Apollo Pharmacy", rating: 4.7, price: 59, originalPrice: 100, discount: "20% OFF" },
    { id: 9, emoji: "🍌", name: "Banana (1kg)", store: "Fresh Vegetables Store", rating: 4.5, price: 28, originalPrice: 60, discount: "20% OFF" },
    { id: 10, emoji: "🍞", name: "Britannia Bread (250g)", store: "Quality Bakery", rating: 4.4, price: 30, originalPrice: 40, discount: "25% OFF" },
    { id: 11, emoji: "🍵", name: "Tata Tea Premium (250g)", store: "Gupta Kirana Store", rating: 4.6, price: 109, originalPrice: 150, discount: "22% OFF" },
    { id: 12, emoji: "🚽", name: "Harpic Toilet Cleaner (500ml)", store: "Gupta Kirana Store", rating: 4.8, price: 79, originalPrice: 100, discount: "20% OFF" },
  ];

  const bestSellers: Product[] = [
    { id: 13, emoji: "🍜", name: "Maggi 2-Minute Noodles (280g)", store: "Gupta Kirana Store", rating: 4.6, price: 28 },
    { id: 14, emoji: "👕", name: "Tide Detergent Powder (1kg)", store: "Gupta Kirana Store", rating: 4.5, price: 93 },
    { id: 15, emoji: "☕", name: "Bournvita (500g)", store: "Apollo Pharmacy", rating: 4.7, price: 215 },
    { id: 16, emoji: "👶", name: "Pampers Diapers (M)", store: "Apollo Pharmacy", rating: 4.6, price: 399 },
    { id: 17, emoji: "🧃", name: "Real Mixed Fruit Juice (1L)", store: "Gupta Kirana Store", rating: 4.4, price: 99 },
    { id: 18, emoji: "🧴", name: "Vaseline Intensive Care (400ml)", store: "Beauty Care Store", rating: 4.8, price: 199 },
  ];

  const newArrivals: Product[] = [
    { id: 19, emoji: "🌱", name: "Organic Toor Dal (1kg)", store: "Gupta Kirana Store", rating: 4.4, price: 120 },
    { id: 20, emoji: "🧖", name: "Himalaya Face Wash (150ml)", store: "Beauty Care Store", rating: 4.5, price: 155 },
    { id: 21, emoji: "✏️", name: "Cello Pen (10 Pcs)", store: "City Stationers", rating: 4.6, price: 45 },
    { id: 22, emoji: "🌽", name: "Corn Flakes (475g)", store: "Gupta Kirana Store", rating: 4.7, price: 199 },
    { id: 23, emoji: "🥜", name: "Dry Fruits Mix (250g)", store: "Gupta Kirana Store", rating: 4.8, price: 250 },
    { id: 24, emoji: "✂️", name: "Syska Trimmer", store: "Sharma Electronics", rating: 4.3, price: 899 },
  ];


  const flashDealsExtra = (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-neutral-500 dark:text-neutral-400">Ends in:</span>
      <div className="flex gap-1 text-danger font-bold">
        <span className="bg-danger-subtle px-1.5 py-0.5 rounded text-danger">02</span>:
        <span className="bg-danger-subtle px-1.5 py-0.5 rounded text-danger">45</span>:
        <span className="bg-danger-subtle px-1.5 py-0.5 rounded text-danger">33</span>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      <CategoryNav />
      <HeroBanner />
      <UspBar />
      <CategoryGrid />
      <StoreCarousel />
      <ProductCarousel title="Popular Products" products={popularProducts} />
      <ProductCarousel title="Flash Deals" products={flashDeals} extraHeader={flashDealsExtra} />
      <PromoBanners />
      <ProductCarousel title="Best Sellers" products={bestSellers} />
      <ProductCarousel title="New Arrivals" products={newArrivals} />
      <Footer />
    </main>
  );
}
