"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { SearchResults } from "@/components/search/SearchResults";
import { RightSidebar } from "@/components/search/RightSidebar";

export interface SearchFilters {
  categories: string[];
  shopTypes: string[];
  brands: string[];
  maxPrice: number;
  sortBy: string;
}

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    shopTypes: [],
    brands: [],
    maxPrice: 500,
    sortBy: "relevance",
  });

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      <CategoryNav />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Filter Sidebar */}
          <div className="lg:col-span-3">
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </div>

          {/* Main Results Area */}
          <div className="lg:col-span-6">
            <React.Suspense fallback={<div className="p-8 text-center text-neutral-500 dark:text-neutral-400">Loading results...</div>}>
              <SearchResults filters={filters} setFilters={setFilters} />
            </React.Suspense>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <RightSidebar />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
