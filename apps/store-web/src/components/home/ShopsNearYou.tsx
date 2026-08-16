"use client";

import React from "react";
import { Star, MapPin, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export const ShopsNearYou = () => {
  const shops = [
    { name: "Gupta Kirana Store", area: "Connaught Place", rating: 4.8, distance: "0.8 km", time: "15-20 min", icon: "🏪" },
    { name: "Fresh Mart Supermarket", area: "Karol Bagh", rating: 4.6, distance: "1.2 km", time: "20-25 min", icon: "🛒" },
    { name: "Apollo Pharmacy", area: "Rajouri Garden", rating: 4.9, distance: "0.5 km", time: "10-15 min", icon: "💊" },
    { name: "City Supermarket", area: "Lajpat Nagar", rating: 4.7, distance: "1.5 km", time: "25-30 min", icon: "🏬" },
  ];

  return (
    <div className="space-y-4 my-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">Shops Near You</h3>
        <Link href="/search" className="text-xs font-semibold text-primary flex items-center gap-0.5 hover:underline">
          View All Shops <ChevronRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {shops.map((shop, idx) => (
          <div
            key={idx}
            className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800/80 hover:shadow-md transition-shadow space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{shop.icon}</span>
              <div className="flex items-center gap-1 text-xs font-bold text-neutral-800 dark:text-neutral-100 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                <Star size={12} className="text-warning fill-warning" />
                <span>{shop.rating}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">{shop.name}</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{shop.area}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-1">
                <MapPin size={12} className="text-neutral-400" />
                <span>{shop.distance}</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-emerald-600">
                <Clock size={12} />
                <span>{shop.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
