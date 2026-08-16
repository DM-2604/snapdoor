"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import {
  Search, MapPin, ChevronRight, Clock, ShieldCheck,
  Zap, Loader2, Store, AlertCircle, SlidersHorizontal,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocationStore } from "@/stores/location.store";
import { customerApi, NearbyStore, Category } from "@/lib/customer-api";

// ── Category Emoji fallback ───────────────────────────────────────────────────

const CATEGORY_EMOJI: Record<string, string> = {
  kirana: "🏪", grocery: "🛒", pharmacy: "💊", medical: "💊",
  bakery: "🍞", dairy: "🥛", electronics: "🎧", clothing: "👕",
  fashion: "👗", stationery: "📚", vegetables: "🥦", fruits: "🍎",
  hardware: "🛠️", personal: "🧴", household: "🧹", default: "🏬",
};

function getCategoryEmoji(name?: string | null): string {
  if (!name) return CATEGORY_EMOJI.default;
  const lower = name.toLowerCase();
  const key = Object.keys(CATEGORY_EMOJI).find((k) => lower.includes(k));
  return key ? CATEGORY_EMOJI[key] : CATEGORY_EMOJI.default;
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────

function StoreCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 space-y-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-3/4" />
          <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-1/2" />
        </div>
      </div>
      <div className="h-px bg-neutral-100 dark:bg-neutral-800" />
      <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-2/3" />
      <div className="h-9 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
    </div>
  );
}

// ── Store Card ────────────────────────────────────────────────────────────────

function StoreCard({ shop }: { shop: NearbyStore }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-2xl shrink-0">
              {getCategoryEmoji(shop.description)}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm line-clamp-1">
                  {shop.name}
                </h3>
                <ShieldCheck size={14} className="text-primary fill-primary/10 shrink-0" />
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium line-clamp-1">
                {shop.description || "Local Store"}
              </p>
            </div>
          </div>

          {/* Open / Closed badge */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              shop.isOpen
                ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {shop.isOpen ? "Open" : "Closed"}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1 font-bold text-neutral-700 dark:text-neutral-200">
            <Clock size={12} className="text-primary" />
            <span>{shop.avgPrepTimeMinutes ? `${shop.avgPrepTimeMinutes}–${shop.avgPrepTimeMinutes + 10} min` : "Fast"}</span>
          </div>
          <span>{shop.deliveryRadiusKm ? `${shop.deliveryRadiusKm} km radius` : "—"}</span>
          <span>{shop.distanceKm.toFixed(1)} km away</span>
        </div>

        {shop.deliveryFee === 0 && (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1 w-max">
            <Zap size={11} className="text-primary" />
            Free Delivery
          </div>
        )}
      </div>

      <Link
        href={`/store/${shop.id}`}
        className="w-full py-2.5 bg-neutral-50 dark:bg-neutral-950 hover:bg-primary hover:text-white border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 font-bold rounded-xl text-center transition-all block text-xs"
      >
        Browse Products →
      </Link>
    </div>
  );
}

// ── Category Pills (skeleton + real) ─────────────────────────────────────────

function CategoryPills({
  categories,
  isLoading,
  selectedId,
  onSelect,
  stores,
}: {
  categories: Category[];
  isLoading: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  stores: NearbyStore[];
}) {
  const pillCls = (active: boolean) =>
    `px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
      active
        ? "bg-primary text-white border-primary shadow-xs"
        : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
    }`;



  if (isLoading) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[80, 120, 100, 90, 110].map((w, i) => (
          <div
            key={i}
            style={{ width: w }}
            className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      <button className={pillCls(selectedId === "all")} onClick={() => onSelect("all")}>
        All Shops ({stores.length})
      </button>
      {categories.map((cat) => {
        const count = stores.filter((s) => s.businessCategoryId === cat.id).length;
        return (
          <button
            key={cat.id}
            className={pillCls(selectedId === cat.id)}
            onClick={() => onSelect(cat.id)}
          >
            {getCategoryEmoji(cat.name)} {cat.name} ({count})
          </button>
        );
      })}
    </div>
  );
}

// ── Inner page (needs useSearchParams) ───────────────────────────────────────

function ShopsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("businessCategoryId") ?? "all";

  const { city, address, lat, lng } = useLocationStore();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync URL param → state when URL changes externally
  React.useEffect(() => {
    setSelectedCategory(searchParams.get("businessCategoryId") ?? "all");
  }, [searchParams]);

  const updateCategory = (id: string) => {
    setSelectedCategory(id);
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") {
      params.delete("businessCategoryId");
    } else {
      params.set("businessCategoryId", id);
    }
    router.replace(`/shops?${params.toString()}`, { scroll: false });
  };

  // Fetch categories for pills
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["categories", "vertical"],
    queryFn: () => customerApi.categories('vertical'),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch nearby stores
  const {
    data: stores,
    isLoading: storesLoading,
    error: storesError,
  } = useQuery<NearbyStore[]>({
    queryKey: ["nearby-stores", lat, lng],
    queryFn: () => customerApi.nearbyStores(lat!, lng!),
    enabled: lat !== null && lng !== null,
    staleTime: 5 * 60 * 1000,
  });

  // Build category name lookup for search matching
  const categoryNameMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  // Filter: by category businessCategoryId and by search query (name, desc, category name)
  const filteredShops = (stores ?? []).filter((shop) => {
    const matchesCat = selectedCategory === "all" || shop.businessCategoryId === selectedCategory;
    const q = searchQuery.toLowerCase();
    const catName = categoryNameMap[shop.businessCategoryId] ?? "";
    const matchesQuery =
      !q ||
      shop.name.toLowerCase().includes(q) ||
      (shop.description ?? "").toLowerCase().includes(q) ||
      catName.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const isLoading = storesLoading;

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
      <Header />
      <CategoryNav />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-3 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-white font-bold">Local Shops</span>
        {selectedCategory !== "all" && (
          <>
            <ChevronRight size={12} />
            <span className="text-primary font-bold">
              {categories.find((c) => c.id === selectedCategory)?.name ?? "Category"}
            </span>
          </>
        )}
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 pb-12 space-y-6">
        {/* Title Header */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <MapPin size={16} />
              <span>Delivering from verified stores in {city || "your area"}</span>
            </div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
              {selectedCategory === "all"
                ? "Local Stores Near You"
                : `${categories.find((c) => c.id === selectedCategory)?.name ?? "Stores"} Near You`}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md line-clamp-1">
              {address || "Order directly from trusted neighbourhood shops"}
            </p>
          </div>

          {/* Search */}
          <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-950 focus-within:border-primary w-full md:w-80 transition-colors">
            <div className="pl-3 text-neutral-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search local shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 px-3 bg-transparent outline-none text-xs text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <CategoryPills
          categories={categories}
          isLoading={categoriesLoading}
          selectedId={selectedCategory}
          onSelect={updateCategory}
          stores={stores ?? []}
        />

        {/* No location */}
        {!lat && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-500 gap-3">
            <MapPin size={48} className="text-primary/30" />
            <p className="font-bold text-neutral-800 dark:text-neutral-200">Location not set</p>
            <p className="text-sm text-center">Share your location in the top bar to discover nearby shops.</p>
          </div>
        )}

        {/* Error */}
        {storesError && !isLoading && lat && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
            <AlertCircle size={36} className="text-red-300" />
            <p className="font-bold">Could not load nearby stores</p>
            <p className="text-sm text-neutral-500">Check your connection and try again.</p>
          </div>
        )}

        {/* Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <StoreCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !storesError && lat && filteredShops.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-500">
            <Store size={48} className="text-neutral-200 dark:text-neutral-700" />
            <p className="font-bold text-neutral-800 dark:text-neutral-200">
              {searchQuery ? "No stores match your search" : "No stores deliver to your location yet"}
            </p>
            <p className="text-sm text-center max-w-sm">
              {searchQuery
                ? "Try a different keyword or clear your search."
                : "We're expanding! More stores are joining every week."}
            </p>
            {selectedCategory !== "all" && (
              <button
                onClick={() => updateCategory("all")}
                className="mt-2 px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-dark transition-colors"
              >
                View All Shops
              </button>
            )}
          </div>
        )}

        {/* Stores Grid */}
        {!isLoading && filteredShops.length > 0 && (
          <>
            <p className="text-xs text-neutral-500 font-medium">
              {filteredShops.length} store{filteredShops.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredShops.map((shop) => (
                <StoreCard key={shop.id} shop={shop} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}

// ── Page export (wraps Suspense for useSearchParams) ──────────────────────────

export default function ShopsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </main>
      }
    >
      <ShopsInner />
    </Suspense>
  );
}
