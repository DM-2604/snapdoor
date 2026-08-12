import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const CategoryGrid = () => {
  const categories = [
    { name: "Grocery & Kirana", icon: "🛒", bgColor: "bg-blue-50" },
    { name: "Medical & Pharmacy", icon: "💊", bgColor: "bg-green-50" },
    { name: "Stationery & Books", icon: "📚", bgColor: "bg-yellow-50" },
    { name: "Fruits & Vegetables", icon: "🍎", bgColor: "bg-red-50" },
    { name: "Bakery & Dairy", icon: "🍞", bgColor: "bg-orange-50" },
    { name: "Personal Care & Cosmetics", icon: "🧴", bgColor: "bg-pink-50" },
    { name: "Household Essentials", icon: "🧹", bgColor: "bg-purple-50" },
    { name: "Electronics & Accessories", icon: "🎧", bgColor: "bg-indigo-50" },
    { name: "Clothing & Fashion", icon: "👕", bgColor: "bg-rose-50" },
    { name: "Hardware & Tools", icon: "🛠️", bgColor: "bg-gray-50" },
    { name: "More Categories", icon: "⊞", bgColor: "bg-neutral-100 dark:bg-neutral-800" },
  ];

  return (
    <div className="w-full px-4 md:px-8 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">Popular Categories</h3>
        <Link href="/search" className="flex items-center text-sm font-medium text-primary hover:underline">
          View All <ChevronRight size={16} />
        </Link>
      </div>

      <div className="flex flex-wrap md:flex-nowrap justify-between gap-4 overflow-x-auto no-scrollbar pb-4">
        {categories.map((cat, index) => (
          <Link href={`/search?category=${encodeURIComponent(cat.name)}`} key={index} className="flex flex-col items-center gap-3 min-w-[80px] md:min-w-[100px] cursor-pointer group">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${cat.bgColor} flex items-center justify-center text-3xl group-hover:shadow-md transition-shadow`}>
              {cat.icon}
            </div>
            <span className="text-[11px] md:text-xs font-medium text-neutral-700 dark:text-neutral-300 text-center leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
