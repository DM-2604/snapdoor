'use client';

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { customerApi, Category } from "@/lib/customer-api";

const BG_COLORS = [
  'bg-blue-50 dark:bg-blue-900/20',
  'bg-green-50 dark:bg-green-900/20',
  'bg-yellow-50 dark:bg-yellow-900/20',
  'bg-red-50 dark:bg-red-900/20',
  'bg-orange-50 dark:bg-orange-900/20',
  'bg-pink-50 dark:bg-pink-900/20',
  'bg-purple-50 dark:bg-purple-900/20',
  'bg-indigo-50 dark:bg-indigo-900/20',
  'bg-rose-50 dark:bg-rose-900/20',
  'bg-teal-50 dark:bg-teal-900/20',
];

const EMOJI_MAP: Record<string, string> = {
  grocery: '🛒', kirana: '🏪', medical: '💊', pharmacy: '💊',
  stationery: '📚', books: '📚', fruit: '🍎', vegetable: '🥦',
  bakery: '🍞', dairy: '🥛', personal: '🧴', cosmetic: '💄',
  household: '🧹', electronic: '🎧', clothing: '👕', fashion: '👗',
  hardware: '🛠️', default: '🏬',
};

function getEmoji(name: string, iconUrl?: string | null): string {
  if (iconUrl) return iconUrl;
  const lower = name.toLowerCase();
  const key = Object.keys(EMOJI_MAP).find((k) => lower.includes(k));
  return key ? EMOJI_MAP[key] : EMOJI_MAP.default;
}

function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 min-w-[80px] md:min-w-[100px] animate-pulse">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-neutral-100 dark:bg-neutral-800" />
      <div className="h-3 w-14 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
    </div>
  );
}

export const CategoryGrid = () => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories', 'vertical'],
    queryFn: () => customerApi.categories('vertical'),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="w-full px-4 md:px-8 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">Shop by Category</h3>
        <Link href="/search" className="flex items-center text-sm font-medium text-primary hover:underline">
          View All <ChevronRight size={16} />
        </Link>
      </div>

      <div className="flex flex-wrap md:flex-nowrap justify-between gap-4 overflow-x-auto no-scrollbar pb-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)
          : categories && categories.length > 0
          ? [
              ...categories.map((cat, idx) => (
                <Link
                  key={cat.id}
                  href={`/shops?businessCategoryId=${cat.id}`}
                  className="flex flex-col items-center gap-3 min-w-[80px] md:min-w-[100px] cursor-pointer group"
                >
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${BG_COLORS[idx % BG_COLORS.length]} flex items-center justify-center text-3xl group-hover:shadow-md transition-shadow`}>
                    {getEmoji(cat.name, cat.iconUrl)}
                  </div>
                  <span className="text-[11px] md:text-xs font-medium text-neutral-700 dark:text-neutral-300 text-center leading-tight">
                    {cat.name}
                  </span>
                </Link>
              )),
              <Link key="more" href="/search" className="flex flex-col items-center gap-3 min-w-[80px] md:min-w-[100px] cursor-pointer group">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-2xl group-hover:shadow-md transition-shadow">
                  ⊞
                </div>
                <span className="text-[11px] md:text-xs font-medium text-neutral-700 dark:text-neutral-300 text-center leading-tight">
                  More
                </span>
              </Link>,
            ]
          : (
            <p className="text-sm text-neutral-400 py-8">No categories available</p>
          )
        }
      </div>
    </div>
  );
};
