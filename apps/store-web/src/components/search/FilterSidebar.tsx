"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { customerApi, Category } from "@/lib/customer-api";
import type { SearchFilters } from "@/types/search";

interface FilterSidebarProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters }) => {
  const [categoriesOpen, setCategoriesOpen] = React.useState(true);
  const [priceOpen, setPriceOpen] = React.useState(true);

  // Real categories from DB
  const { data: categories = [], isLoading: catsLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => customerApi.categories(),
    staleTime: 10 * 60 * 1000,
  });

  const toggleCategory = (id: string) => {
    setFilters((prev: SearchFilters) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c: string) => c !== id)
        : [...prev.categories, id],
    }));
  };

  const clearAll = () => {
    setFilters({ categories: [], shopTypes: [], brands: [], maxPrice: 500, sortBy: "relevance" });
  };

  const setPriceRange = (price: number) => {
    setFilters((prev: SearchFilters) => ({ ...prev, maxPrice: price }));
  };

  const activeFilterCount =
    filters.categories.length + (filters.maxPrice < 500 ? 1 : 0);

  return (
    <aside className="w-full bg-neutral-50 dark:bg-neutral-950/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800/80 space-y-5 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <h3 className="font-bold text-neutral-900 dark:text-white text-base">
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 text-xs font-bold text-white bg-primary px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h3>
        <button
          onClick={clearAll}
          disabled={activeFilterCount === 0}
          className={`text-xs font-semibold transition-colors ${
            activeFilterCount > 0 ? "text-primary hover:underline" : "text-neutral-300 dark:text-neutral-600 cursor-not-allowed"
          }`}
        >
          Clear All
        </button>
      </div>

      {/* Category Section — real from DB */}
      <div className="border-b border-neutral-200 dark:border-neutral-800/60 pb-5">
        <button
          onClick={() => setCategoriesOpen(!categoriesOpen)}
          className="flex items-center justify-between w-full font-bold text-neutral-800 dark:text-neutral-100 mb-3"
        >
          <span>Category</span>
          {categoriesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {categoriesOpen && (
          <div className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300">
            {/* All */}
            <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-neutral-900 dark:text-white">
              <input
                type="checkbox"
                checked={filters.categories.length === 0}
                onChange={() => setFilters((prev: SearchFilters) => ({ ...prev, categories: [] }))}
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
              <span>All Categories</span>
            </label>

            {catsLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                ))
              : categories.map((cat) => (
                  <label key={cat.id} className="flex items-center justify-between cursor-pointer hover:text-primary">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                      />
                      <span>{cat.name}</span>
                    </div>
                  </label>
                ))
            }
          </div>
        )}
      </div>

      {/* Price Range */}
      <div>
        <button
          onClick={() => setPriceOpen(!priceOpen)}
          className="flex items-center justify-between w-full font-bold text-neutral-800 dark:text-neutral-100 mb-3"
        >
          <span>Max Price</span>
          {priceOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {priceOpen && (
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="500"
              value={filters.maxPrice}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between font-bold text-xs text-neutral-800 dark:text-neutral-100">
              <span>₹0</span>
              <span className="text-primary">₹{filters.maxPrice}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { label: "Under ₹50", value: 50 },
                { label: "Under ₹100", value: 100 },
                { label: "Under ₹200", value: 200 },
                { label: "Any price", value: 500 },
              ].map((pill) => (
                <button
                  key={pill.label}
                  onClick={() => setPriceRange(pill.value)}
                  className={`py-1.5 px-2 rounded-md font-medium border transition-colors ${
                    filters.maxPrice === pill.value
                      ? "bg-primary text-white border-primary"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200/80"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
