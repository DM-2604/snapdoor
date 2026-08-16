"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, Star, Heart, Clock, MapPin, ChevronDown } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import type { SearchFilters } from "@/types/search";

interface SearchResultsProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
}

const ALL_PRODUCTS = [
  {
    brand: "Amul",
    brandId: "amul",
    category: "dairy",
    shopType: "local",
    name: "Amul Taaza Toned Milk",
    pack: "1 L Pouch",
    rating: 4.6,
    reviews: "12.5K",
    price: 56,
    originalPrice: 59,
    discount: "5% OFF",
    icon: "🥛",
  },
  {
    brand: "Mother Dairy",
    brandId: "mother-dairy",
    category: "dairy",
    shopType: "local",
    name: "Mother Dairy Toned Milk",
    pack: "1 L Pouch",
    rating: 4.5,
    reviews: "8.7K",
    price: 54,
    originalPrice: 59,
    discount: "8% OFF",
    icon: "🥛",
  },
  {
    brand: "Amul",
    brandId: "amul",
    category: "dairy",
    shopType: "supermarket",
    name: "Amul Gold Full Cream Milk",
    pack: "1 L Bottle",
    rating: 4.7,
    reviews: "15.2K",
    price: 68,
    originalPrice: 76,
    discount: "10% OFF",
    icon: "🍾",
  },
  {
    brand: "Nandini",
    brandId: "nandini",
    category: "dairy",
    shopType: "local",
    name: "Nandini Fresh Milk",
    pack: "500 ml Pouch",
    rating: 4.4,
    reviews: "2.1K",
    price: 26,
    originalPrice: 28,
    discount: "7% OFF",
    icon: "🥛",
  },
  {
    brand: "So Good",
    brandId: "so-good",
    category: "dairy",
    shopType: "supermarket",
    name: "So Good Almond Milk",
    pack: "1 L",
    rating: 4.3,
    reviews: "1.3K",
    price: 135,
    originalPrice: 145,
    discount: "6% OFF",
    icon: "🧃",
  },
  {
    brand: "Nestle",
    brandId: "nestle",
    category: "dairy",
    shopType: "supermarket",
    name: "Nestle Everyday Dairy Whitener",
    pack: "400 g",
    rating: 4.3,
    reviews: "9.6K",
    price: 103,
    originalPrice: 115,
    discount: "9% OFF",
    icon: "🥫",
  },
  {
    brand: "Britannia",
    brandId: "britannia",
    category: "grocery",
    shopType: "supermarket",
    name: "Britannia Marie Gold Biscuit",
    pack: "250 g",
    rating: 4.5,
    reviews: "6.2K",
    price: 35,
    originalPrice: 40,
    discount: "12% OFF",
    icon: "🍪",
  },
  {
    brand: "ITC",
    brandId: "itc",
    category: "grocery",
    shopType: "local",
    name: "Aashirvaad Whole Wheat Atta",
    pack: "5 kg",
    rating: 4.8,
    reviews: "14.5K",
    price: 265,
    originalPrice: 300,
    discount: "12% OFF",
    icon: "🌾",
  },
  {
    brand: "Amul",
    brandId: "amul",
    category: "dairy",
    shopType: "local",
    name: "Amul Butter",
    pack: "100 g",
    rating: 4.7,
    reviews: "8.1K",
    price: 55,
    originalPrice: 60,
    discount: "8% OFF",
    icon: "🧈",
  },
  {
    brand: "Nestle",
    brandId: "nestle",
    category: "grocery",
    shopType: "supermarket",
    name: "Maggi 2-Minute Noodles",
    pack: "280 g (Pack of 4)",
    rating: 4.4,
    reviews: "22.3K",
    price: 48,
    originalPrice: 56,
    discount: "14% OFF",
    icon: "🍜",
  },
  {
    brand: "Dettol",
    brandId: "dettol",
    category: "personal",
    shopType: "pharmacy",
    name: "Dettol Original Soap",
    pack: "125 g",
    rating: 4.5,
    reviews: "5.6K",
    price: 48,
    originalPrice: 52,
    discount: "8% OFF",
    icon: "🧼",
  },
  {
    brand: "Colgate",
    brandId: "colgate",
    category: "personal",
    shopType: "pharmacy",
    name: "Colgate MaxFresh Toothpaste",
    pack: "150 g",
    rating: 4.3,
    reviews: "7.4K",
    price: 99,
    originalPrice: 110,
    discount: "10% OFF",
    icon: "🪥",
  },
];

const ALL_SHOPS = [
  {
    name: "Goyal Kirana Store",
    category: "Kirana Store",
    shopType: "local",
    rating: 4.6,
    reviews: "1.2K",
    distance: "1.2 km",
    open: true,
    time: "20-30 min",
    discount: "10% OFF",
    icon: "🏪",
  },
  {
    name: "HealthPlus Pharmacy",
    category: "Pharmacy",
    shopType: "pharmacy",
    rating: 4.7,
    reviews: "890",
    distance: "1.5 km",
    open: true,
    time: "15-25 min",
    discount: "5% OFF",
    icon: "💊",
  },
  {
    name: "Fresh Mart Supermarket",
    category: "Supermarket",
    shopType: "supermarket",
    rating: 4.5,
    reviews: "3.5K",
    distance: "2.1 km",
    open: true,
    time: "25-35 min",
    discount: "15% OFF",
    icon: "🛒",
  },
  {
    name: "Sharma Dairy & Foods",
    category: "Dairy Store",
    shopType: "local",
    rating: 4.4,
    reviews: "760",
    distance: "1.8 km",
    open: true,
    time: "20-30 min",
    discount: "8% OFF",
    icon: "🥛",
  },
  {
    name: "City Stationers",
    category: "Stationery Store",
    shopType: "bakery",
    rating: 4.3,
    reviews: "540",
    distance: "2.3 km",
    open: true,
    time: "20-30 min",
    discount: "5% OFF",
    icon: "✏️",
  },
];

const SEARCH_CATEGORIES = [
  { name: "Dairy & Milk", count: 42, icon: "🥛" },
  { name: "Milk Powders", count: 18, icon: "🥫" },
  { name: "Flavoured Milk", count: 16, icon: "🧃" },
  { name: "Plant Based Milk", count: 12, icon: "🌱" },
  { name: "Milk Products", count: 22, icon: "🧀" },
  { name: "Baby Milk Food", count: 10, icon: "🍼" },
];

export const SearchResults: React.FC<SearchResultsProps> = ({ filters, setFilters }) => {
  const { incrementCart, wishlistItems, toggleWishlist } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 8;

  const popularSearches = [
    "amul milk",
    "toned milk",
    "milk powder",
    "badam milk",
    "oats milk",
    "lactose free milk",
  ];

  const filteredProducts = ALL_PRODUCTS.filter((p) => {
    // Text search
    const matchesQuery = !query || p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query);
    // Category filter
    const matchesCategory = filters.categories.length === 0 || filters.categories.includes(p.category);
    // Brand filter
    const matchesBrand = filters.brands.length === 0 || filters.brands.includes(p.brandId);
    // Shop type filter
    const matchesShopType = filters.shopTypes.length === 0 || filters.shopTypes.includes(p.shopType);
    // Price filter
    const matchesPrice = p.price <= filters.maxPrice;

    return matchesQuery && matchesCategory && matchesBrand && matchesShopType && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case "price_low":
        return a.price - b.price;
      case "price_high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Apply filters to shops
  const filteredShops = ALL_SHOPS.filter((s) => {
    const matchesQuery = !query || s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query);
    const matchesShopType = filters.shopTypes.length === 0 || filters.shopTypes.includes(s.shopType);
    return matchesQuery && matchesShopType;
  });

  const filteredCategories = SEARCH_CATEGORIES.filter((c) =>
    !query || c.name.toLowerCase().includes(query)
  );

  const totalResults = sortedProducts.length + filteredShops.length + filteredCategories.length;

  return (
    <div className="flex-1 space-y-6">
      {/* Search Result Title & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Search Results for <span className="text-primary">&quot;{query}&quot;</span>
          </h2>
          <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{totalResults} results found</span>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((prev: SearchFilters) => ({ ...prev, sortBy: e.target.value }))}
                className="appearance-none bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 pr-7 rounded-lg cursor-pointer text-xs font-semibold text-neutral-800 dark:text-neutral-100 outline-none focus:border-primary"
              >
                <option value="relevance">Sort by: Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800 text-sm overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100"
            }`}
          >
            All Results ({totalResults})
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === "products"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100"
            }`}
          >
            Products ({sortedProducts.length})
          </button>
          <button
            onClick={() => setActiveTab("shops")}
            className={`pb-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === "shops"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100"
            }`}
          >
            Shops ({filteredShops.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`pb-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === "categories"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100"
            }`}
          >
            Categories ({filteredCategories.length})
          </button>
        </div>

        {/* Popular Searches Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="font-semibold text-neutral-500 dark:text-neutral-400 mr-1">Popular Searches:</span>
          {popularSearches.map((term, idx) => (
            <span
              key={idx}
              onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
              className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 text-neutral-700 dark:text-neutral-300 font-medium rounded-full cursor-pointer transition-colors"
            >
              {term}
            </span>
          ))}
        </div>
      </div>

      {/* Products Section */}
      {(activeTab === "all" || activeTab === "products") && sortedProducts.length > 0 && (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-neutral-800 dark:text-neutral-100 text-base">Products ({sortedProducts.length})</h3>
          <Link href={`/search?q=${encodeURIComponent(query)}&tab=products`} className="text-xs font-semibold text-primary flex items-center gap-0.5 hover:underline">
            View all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="relative">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {paginatedProducts.map((prod, idx) => (
              <div
                key={idx}
                className="min-w-[170px] max-w-[170px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-xl p-3 hover:shadow-md transition-shadow relative flex flex-col justify-between group"
              >
                {/* Discount Badge */}
                {prod.discount && (
                  <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                    {prod.discount}
                  </span>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(prod.name)}
                  className="absolute top-2.5 right-2.5 text-neutral-400 hover:text-danger z-10 transition-colors"
                >
                  <Heart
                    size={15}
                    className={wishlistItems.includes(prod.name) ? "fill-danger text-danger" : ""}
                  />
                </button>

                {/* Image Placeholder */}
                <Link href={`/product/${(idx + 1) + (currentPage - 1) * PRODUCTS_PER_PAGE}`} className="block cursor-pointer">
                  <div className="w-full h-28 bg-neutral-50 dark:bg-neutral-950 rounded-lg flex items-center justify-center text-3xl mb-2">
                    {prod.icon}
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-neutral-400">{prod.brand}</p>
                    <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {prod.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{prod.pack}</p>
                  </div>
                </Link>

                <div className="pt-2">
                  <div className="flex items-center gap-1 text-[11px] mb-2">
                    <Star size={12} className="text-warning fill-warning" />
                    <span className="font-bold text-neutral-700 dark:text-neutral-300">{prod.rating}</span>
                    <span className="text-neutral-400 text-[10px]">({prod.reviews})</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <div>
                      <span className="font-bold text-xs text-neutral-900 dark:text-white">₹{prod.price}</span>
                      {prod.originalPrice && (
                        <span className="text-[10px] text-neutral-400 line-through ml-1">
                          ₹{prod.originalPrice}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => incrementCart(prod.name)}
                      className="px-2.5 py-1 text-xs font-bold text-primary border border-primary/50 hover:bg-primary hover:text-white rounded-md transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full shadow-md items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-primary z-10"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-bold border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${
                  page === currentPage
                    ? "bg-primary text-white shadow-sm"
                    : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-bold border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}

      </div>
      )}

      {/* Shops Section */}
      {(activeTab === "all" || activeTab === "shops") && filteredShops.length > 0 && (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-neutral-800 dark:text-neutral-100 text-base">Shops ({filteredShops.length})</h3>
        </div>

        <div className="relative">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {filteredShops.map((shop, idx) => (
              <div
                key={idx}
                className="min-w-[210px] max-w-[210px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
              >
                {/* Banner / Store Header */}
                <div className="h-24 bg-neutral-100 dark:bg-neutral-800 relative flex items-center justify-center text-3xl">
                  {shop.icon}
                  {/* Small Store Avatar */}
                  <div className="absolute left-3 bottom-2 w-8 h-8 rounded-lg bg-white dark:bg-neutral-900 shadow border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-sm font-bold text-primary">
                    {shop.name.charAt(0)}
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <div>
                    <h4 className="font-bold text-xs text-neutral-900 dark:text-white group-hover:text-primary transition-colors truncate">
                      {shop.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{shop.category}</p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-warning fill-warning" />
                      <span className="font-bold">{shop.rating}</span>
                      <span className="text-neutral-400 text-[10px]">({shop.reviews})</span>
                    </div>
                    <span className="text-neutral-300">•</span>
                    <div className="flex items-center gap-0.5">
                      <MapPin size={11} className="text-neutral-400" />
                      <span>{shop.distance}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-success">Open</span>
                      <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                        <Clock size={11} />
                        <span>{shop.time}</span>
                      </div>
                    </div>
                    {shop.discount && (
                      <span className="bg-warning-subtle text-warning-dark font-bold text-[10px] px-1.5 py-0.5 rounded">
                        {shop.discount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full shadow-md items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-primary z-10">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      )}

      {/* Categories Section */}
      {(activeTab === "all" || activeTab === "categories") && filteredCategories.length > 0 && (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-neutral-800 dark:text-neutral-100 text-base">Categories ({filteredCategories.length})</h3>
          <Link href="/search" className="text-xs font-semibold text-primary flex items-center gap-0.5 hover:underline">
            View all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {filteredCategories.map((cat, idx) => (
            <div
              key={idx}
              className="bg-neutral-50 dark:bg-neutral-950 hover:bg-white dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-xl p-3 text-center cursor-pointer hover:shadow-md transition-all group flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-full bg-white dark:bg-neutral-900 shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div>
                <h5 className="font-bold text-xs text-neutral-800 dark:text-neutral-100 group-hover:text-primary transition-colors leading-tight">
                  {cat.name}
                </h5>
                <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Products ({cat.count})</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Empty State */}
      {totalResults === 0 && (
        <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">No results found</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            We couldn&apos;t find anything matching your search and filters. Try adjusting your filters or try a different search term.
          </p>
        </div>
      )}
    </div>
  );
};
