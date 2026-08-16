"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const HeroSlider = () => {
  const slides = [
    {
      title: "Fresh Groceries Delivered in 20 Mins",
      subtitle: "Get up to 40% OFF on daily essentials from your nearest local kirana stores.",
      badge: "⚡ Superfast Delivery",
      bg: "bg-gradient-to-r from-emerald-800 to-emerald-600",
      cta: "Shop Now",
    },
    {
      title: "Top Brands & Fresh Vegetables",
      subtitle: "Farm fresh vegetables & fruits delivered directly from local farmers.",
      badge: "🥬 Farm Fresh",
      bg: "bg-gradient-to-r from-green-800 to-teal-700",
      cta: "Explore Categories",
    },
  ];

  const [current, setCurrent] = useState(0);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl my-6">
      <div className={`p-8 md:p-12 text-white ${slides[current].bg} transition-all duration-500 min-h-[220px] flex flex-col justify-center relative`}>
        <span className="inline-block text-xs font-bold bg-white/20 dark:bg-neutral-900/20 backdrop-blur-xs px-3 py-1 rounded-full mb-3 w-max">
          {slides[current].badge}
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold max-w-lg mb-2 leading-tight">
          {slides[current].title}
        </h2>
        <p className="text-xs md:text-sm text-neutral-100 max-w-md mb-6 opacity-90">
          {slides[current].subtitle}
        </p>

        <button className="bg-white dark:bg-neutral-900 text-emerald-800 font-bold px-6 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-max text-xs shadow-lg">
          {slides[current].cta}
        </button>

        {/* Carousel arrows */}
        <button
          onClick={() => setCurrent(current === 0 ? slides.length - 1 : 0)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/30 dark:bg-neutral-900/30 backdrop-blur-xs flex items-center justify-center text-white hover:bg-white/50 dark:hover:bg-neutral-900/50 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setCurrent(current === slides.length - 1 ? 0 : current + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/30 dark:bg-neutral-900/30 backdrop-blur-xs flex items-center justify-center text-white hover:bg-white/50 dark:hover:bg-neutral-900/50 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
