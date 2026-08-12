"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export const ProductGallery = () => {
  const images = [
    "🌾", // Main Atta bag icon representation
    "🌾",
    "🌾",
    "🌾",
  ];

  const [selectedImg, setSelectedImg] = useState(0);

  return (
    <div className="flex gap-4">
      {/* Thumbnail Bar */}
      <div className="flex flex-col gap-3 shrink-0">
        <div className="bg-danger text-white text-[10px] font-bold px-1 py-0.5 rounded text-center mb-1">
          12% OFF
        </div>
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImg(idx)}
            className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
              selectedImg === idx
                ? "border-primary bg-primary-subtle/30 shadow-sm scale-105"
                : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-300 dark:hover:border-neutral-700"
            }`}
          >
            {img}
          </button>
        ))}
      </div>

      {/* Main Image Container */}
      <div className="flex-1 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 p-8 relative flex flex-col items-center justify-center min-h-[380px] group">
        {/* Left/Right Nav Arrows */}
        <button 
          onClick={() => setSelectedImg((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button 
          onClick={() => setSelectedImg((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors"
        >
          <ChevronRight size={18} />
        </button>

        {/* Big Product Image */}
        <div className="text-8xl transition-transform duration-300 group-hover:scale-110">
          {images[selectedImg]}
        </div>

        {/* Zoom Hint */}
        <div className="absolute bottom-4 flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800">
          <ZoomIn size={14} />
          <span>Roll over image to zoom</span>
        </div>
      </div>
    </div>
  );
};
