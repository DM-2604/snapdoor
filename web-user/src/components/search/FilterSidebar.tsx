"use client";

import React from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import type { SearchFilters } from "@/app/search/page";

interface FilterSidebarProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
}

const CATEGORIES = [
  { id: "grocery", label: "Grocery & Kirana", count: 245 },
  { id: "dairy", label: "Dairy & Bakery", count: 186 },
  { id: "medical", label: "Medical & Pharmacy", count: 24 },
  { id: "personal", label: "Personal Care", count: 12 },
  { id: "stationery", label: "Stationery", count: 8 },
  { id: "electronics", label: "Electronics", count: 15 },
];

const SHOP_TYPES = [
  { id: "supermarket", label: "Supermarket", count: 52 },
  { id: "local", label: "Local Store", count: 98 },
  { id: "pharmacy", label: "Pharmacy", count: 18 },
  { id: "bakery", label: "Bakery", count: 12 },
];

const BRANDS = [
  { id: "amul", label: "Amul", count: 24 },
  { id: "mother-dairy", label: "Mother Dairy", count: 18 },
  { id: "nestle", label: "Nestle", count: 16 },
  { id: "britannia", label: "Britannia", count: 14 },
  { id: "itc", label: "ITC", count: 10 },
  { id: "so-good", label: "So Good", count: 6 },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters }) => {
  const [categoriesOpen, setCategoriesOpen] = React.useState(true);
  const [shopTypesOpen, setShopTypesOpen] = React.useState(true);
  const [priceOpen, setPriceOpen] = React.useState(true);
  const [brandOpen, setBrandOpen] = React.useState(true);
  const [searchBrand, setSearchBrand] = React.useState("");

  const toggleCategory = (id: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  };

  const toggleShopType = (id: string) => {
    setFilters((prev) => ({
      ...prev,
      shopTypes: prev.shopTypes.includes(id)
        ? prev.shopTypes.filter((s) => s !== id)
        : [...prev.shopTypes, id],
    }));
  };

  const toggleBrand = (id: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(id)
        ? prev.brands.filter((b) => b !== id)
        : [...prev.brands, id],
    }));
  };

  const clearAll = () => {
    setFilters({
      categories: [],
      shopTypes: [],
      brands: [],
      maxPrice: 500,
      sortBy: "relevance",
    });
  };

  const setPriceRange = (price: number) => {
    setFilters((prev) => ({ ...prev, maxPrice: price }));
  };

  const activeFilterCount =
    filters.categories.length + filters.shopTypes.length + filters.brands.length + (filters.maxPrice < 500 ? 1 : 0);

  const filteredBrands = BRANDS.filter((b) =>
    b.label.toLowerCase().includes(searchBrand.toLowerCase())
  );

  return (
    <aside className="w-full bg-neutral-50 dark:bg-neutral-950/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800/80 space-y-6 text-sm">
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
          className={`text-xs font-semibold transition-colors ${
            activeFilterCount > 0 ? "text-primary hover:underline" : "text-neutral-400 cursor-not-allowed"
          }`}
          disabled={activeFilterCount === 0}
        >
          Clear All
        </button>
      </div>

      {/* Category Section */}
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
            <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-neutral-900 dark:text-white">
              <input
                type="checkbox"
                checked={filters.categories.length === 0}
                onChange={() => setFilters((prev) => ({ ...prev, categories: [] }))}
                className="w-4 h-4 rounded accent-primary cursor-pointer text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
              <span>All Categories</span>
            </label>
            {CATEGORIES.map((cat) => (
              <label key={cat.id} className="flex items-center justify-between cursor-pointer hover:text-primary">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="w-4 h-4 rounded accent-primary cursor-pointer text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                  <span>{cat.label}</span>
                </div>
                <span className="text-neutral-400 text-[11px]">({cat.count})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Shop Type Section */}
      <div className="border-b border-neutral-200 dark:border-neutral-800/60 pb-5">
        <button
          onClick={() => setShopTypesOpen(!shopTypesOpen)}
          className="flex items-center justify-between w-full font-bold text-neutral-800 dark:text-neutral-100 mb-3"
        >
          <span>Shop Type</span>
          {shopTypesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {shopTypesOpen && (
          <div className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300">
            <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-neutral-900 dark:text-white">
              <input
                type="checkbox"
                checked={filters.shopTypes.length === 0}
                onChange={() => setFilters((prev) => ({ ...prev, shopTypes: [] }))}
                className="w-4 h-4 rounded accent-primary cursor-pointer text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
              <span>All Shop Types</span>
            </label>
            {SHOP_TYPES.map((st) => (
              <label key={st.id} className="flex items-center justify-between cursor-pointer hover:text-primary">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={filters.shopTypes.includes(st.id)}
                    onChange={() => toggleShopType(st.id)}
                    className="w-4 h-4 rounded accent-primary cursor-pointer text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                  <span>{st.label}</span>
                </div>
                <span className="text-neutral-400 text-[11px]">({st.count})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div className="border-b border-neutral-200 dark:border-neutral-800/60 pb-5">
        <button
          onClick={() => setPriceOpen(!priceOpen)}
          className="flex items-center justify-between w-full font-bold text-neutral-800 dark:text-neutral-100 mb-3"
        >
          <span>Price Range</span>
          {priceOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {priceOpen && (
          <div className="space-y-4">
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="500"
                value={filters.maxPrice}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
              <div className="flex justify-between font-bold text-xs text-neutral-800 dark:text-neutral-100">
                <span>₹0</span>
                <span>₹{filters.maxPrice}</span>
              </div>
            </div>

            {/* Quick Price Pills */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { label: "Under ₹50", value: 50 },
                { label: "₹50 - ₹100", value: 100 },
                { label: "₹100 - ₹200", value: 200 },
                { label: "Above ₹200", value: 500 },
              ].map((pill) => (
                <button
                  key={pill.label}
                  onClick={() => setPriceRange(pill.value)}
                  className={`py-1.5 px-2 rounded-md font-medium border transition-colors ${
                    filters.maxPrice === pill.value
                      ? "bg-primary text-white border-primary"
                      : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Brand Section */}
      <div>
        <button
          onClick={() => setBrandOpen(!brandOpen)}
          className="flex items-center justify-between w-full font-bold text-neutral-800 dark:text-neutral-100 mb-3"
        >
          <span>Brand</span>
          {brandOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {brandOpen && (
          <div className="space-y-3">
            {/* Search Brand Input */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search Brand"
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-xs outline-none focus:border-primary text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
            </div>

            <div className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300 max-h-40 overflow-y-auto">
              {filteredBrands.map((brand) => (
                <label key={brand.id} className="flex items-center justify-between cursor-pointer hover:text-primary">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand.id)}
                      onChange={() => toggleBrand(brand.id)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                    <span>{brand.label}</span>
                  </div>
                  <span className="text-neutral-400 text-[11px]">({brand.count})</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
