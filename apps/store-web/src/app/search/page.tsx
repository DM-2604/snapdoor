"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import {
  Search, Store, ShoppingBag, ChevronRight, MapPin,
  Tag, Loader2, AlertCircle, Heart, Clock, ShieldCheck, Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocationStore } from "@/stores/location.store";
import { customerApi, NearbyStore, MenuProduct, Category } from "@/lib/customer-api";
import { useCartStore } from "@/stores/cart.store";

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMOJI_MAP: Record<string, string> = {
  grocery: "🛒", kirana: "🏪", pharmacy: "💊", medical: "💊",
  bakery: "🍞", dairy: "🥛", electronics: "🎧", clothing: "👕",
  stationery: "📚", vegetables: "🥦", fruits: "🍎", hardware: "🛠️",
  personal: "🧴", household: "🧹", default: "🛍️",
};

function getEmoji(name?: string | null) {
  if (!name) return EMOJI_MAP.default;
  const lower = name.toLowerCase();
  const key = Object.keys(EMOJI_MAP).find((k) => lower.includes(k));
  return key ? EMOJI_MAP[key] : EMOJI_MAP.default;
}

// ── Product Card Skeleton ─────────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 animate-pulse">
      <div className="h-28 bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-2" />
      <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-2/3 mb-1" />
      <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-full mb-1" />
      <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-1/2" />
    </div>
  );
}

// ── Store Card Skeleton ───────────────────────────────────────────────────────

function StoreCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 animate-pulse space-y-3">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-3/4" />
          <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-1/2" />
        </div>
      </div>
      <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({ product, storeName, storeId }: {
  product: MenuProduct; storeName: string; storeId: string;
}) {
  const { addItem } = useCartStore();
  const defaultVariant = product.variants[0];
  const price = defaultVariant?.effectiveSalePrice ?? defaultVariant?.price ?? product.effectiveSalePrice ?? product.basePrice;
  const originalPrice = defaultVariant?.effectiveSalePrice ? defaultVariant.price : null;
  const inStock = defaultVariant?.inStock ?? false;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-xl p-3 hover:shadow-md transition-shadow flex flex-col relative group">
      {product.saleBadgeText && (
        <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
          {product.saleBadgeText}
        </span>
      )}
      {!inStock && (
        <span className="absolute top-2.5 right-2.5 bg-neutral-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
          Out of Stock
        </span>
      )}

      <Link href={`/product/${product.id}?storeId=${storeId}`} className="block">
        <div className="w-full h-28 bg-neutral-50 dark:bg-neutral-950 rounded-lg flex items-center justify-center text-4xl mb-2">
          {product.images?.[0]
            ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover rounded-lg" />
            : <span>{getEmoji(product.category?.name)}</span>
          }
        </div>
        <p className="text-[10px] text-primary font-bold truncate">{storeName}</p>
        <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 line-clamp-2 leading-tight mt-0.5 group-hover:text-primary transition-colors min-h-[32px]">
          {product.name}
        </h4>
        {product.category && (
          <p className="text-[10px] text-neutral-400 mt-0.5 truncate">{product.category.name}</p>
        )}
      </Link>

      <div className="mt-auto pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 mt-2">
        <div>
          <span className="font-bold text-xs text-neutral-900 dark:text-white">₹{price}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-[10px] text-neutral-400 line-through ml-1">₹{originalPrice}</span>
          )}
        </div>
        <button
          disabled={!inStock || !defaultVariant}
          onClick={() => {
            if (defaultVariant) {
              addItem({
                storeId,
                productVariantId: defaultVariant.id,
                quantity: 1,
              }, {
                productName: product.name,
                variantName: defaultVariant.variantName,
                price,
              });
            }
          }}
          className="px-2.5 py-1 text-xs font-bold text-primary border border-primary/50 hover:bg-primary hover:text-white rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {inStock ? "Add" : "—"}
        </button>
      </div>
    </div>
  );
}

// ── Store Result Card ─────────────────────────────────────────────────────────

function StoreResultCard({ shop, categoryName }: { shop: NearbyStore; categoryName?: string }) {
  return (
    <Link
      href={`/store/${shop.id}`}
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-primary/30 transition-all flex flex-col gap-3 group"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-2xl shrink-0">
          {getEmoji(categoryName ?? shop.description)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white group-hover:text-primary transition-colors truncate">
              {shop.name}
            </h3>
            <ShieldCheck size={13} className="text-primary shrink-0" />
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
            {shop.description || categoryName || "Local Store"}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
          shop.isOpen
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-500"
        }`}>
          {shop.isOpen ? "Open" : "Closed"}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-1 font-bold text-neutral-700 dark:text-neutral-200">
          <Clock size={11} className="text-primary" />
          <span>{shop.avgPrepTimeMinutes ? `${shop.avgPrepTimeMinutes}–${shop.avgPrepTimeMinutes + 10} min` : "Fast"}</span>
        </div>
        <span>{shop.distanceKm.toFixed(1)} km away</span>
        {shop.deliveryFee === 0 && (
          <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
            <Zap size={11} /> Free delivery
          </span>
        )}
      </div>
    </Link>
  );
}

// ── Category Section ──────────────────────────────────────────────────────────

function CategorySection({ categories }: { categories: Category[] }) {
  const colors = [
    "bg-blue-50 dark:bg-blue-900/20 text-blue-700",
    "bg-green-50 dark:bg-green-900/20 text-green-700",
    "bg-amber-50 dark:bg-amber-900/20 text-amber-700",
    "bg-rose-50 dark:bg-rose-900/20 text-rose-700",
    "bg-purple-50 dark:bg-purple-900/20 text-purple-700",
    "bg-teal-50 dark:bg-teal-900/20 text-teal-700",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Tag size={18} className="text-primary" /> Browse by Category
        </h2>
        <Link href="/shops" className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5">
          All Shops <ChevronRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {categories.map((cat, idx) => (
          <Link
            key={cat.id}
            href={`/shops?businessCategoryId=${cat.id}`}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-center hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <div className={`w-12 h-12 rounded-full ${colors[idx % colors.length]} mx-auto flex items-center justify-center text-2xl mb-2 group-hover:scale-105 transition-transform`}>
              {getEmoji(cat.name)}
            </div>
            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-100 group-hover:text-primary transition-colors leading-tight">
              {cat.name}
            </p>
            {cat.children?.length > 0 && (
              <p className="text-[10px] text-neutral-400 mt-0.5">{cat.children.length} sub-cats</p>
            )}
          </Link>
        ))}
      </div>

      {/* Sub-category pills */}
      {categories.some((c) => c.children?.length > 0) && (
        <div className="mt-4 space-y-3">
          {categories.filter((c) => c.children?.length > 0).map((cat) => (
            <div key={cat.id}>
              <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                {cat.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {cat.children.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/shops?businessCategoryId=${cat.id}`}
                    className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-primary hover:text-white rounded-full text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface EnrichedProduct extends MenuProduct {
  storeName: string;
  storeId: string;
}

// ── Inner Search Page ─────────────────────────────────────────────────────────

function SearchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [inputVal, setInputVal] = useState(query);
  const [activeTab, setActiveTab] = useState<"categories" | "stores" | "products">(
    query ? "stores" : "categories"
  );

  const { lat, lng } = useLocationStore();

  const { data: categories = [], isLoading: catsLoading } = useQuery<Category[]>({
    queryKey: ["categories", "vertical"],
    queryFn: () => customerApi.categories('vertical'),
    staleTime: 10 * 60 * 1000,
  });

  const { data: stores = [], isLoading: storesLoading } = useQuery<NearbyStore[]>({
    queryKey: ["nearby-stores", lat, lng],
    queryFn: () => customerApi.nearbyStores(lat!, lng!),
    enabled: lat !== null && lng !== null,
    staleTime: 5 * 60 * 1000,
  });

  // All products from up to 5 nearby stores
  const storeIds = stores.slice(0, 5).map((s) => s.id);
  const { data: allProducts = [], isLoading: productsLoading } = useQuery<EnrichedProduct[]>({
    queryKey: ["search-menus", storeIds.join(",")],
    queryFn: async () => {
      const menus = await Promise.all(storeIds.map((id) => customerApi.storeMenu(id)));
      return menus.flatMap((menu) =>
        menu.items.map((item) => ({ ...item, storeName: menu.storeName, storeId: menu.storeId }))
      );
    },
    enabled: storeIds.length > 0,
    staleTime: 3 * 60 * 1000,
  });

  // Build category name lookup for stores: vertical name (Grocery, Pharmacy...)
  const categoryLookup = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  // Build store → admin-category names lookup from fetched menus
  // (Fruits, Dairy, etc. — store-owner categories scoped to each store)
  const storeAdminCatMap = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    allProducts.forEach((p) => {
      if (!p.category?.name) return;
      (map[p.storeId] ??= []).push(p.category.name);
    });
    // Deduplicate per store
    Object.keys(map).forEach((sid) => {
      map[sid] = [...new Set(map[sid])];
    });
    return map;
  }, [allProducts]);

  // Filtered results by query
  const q = query.toLowerCase();

  const filteredStores = q
    ? stores.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description ?? "").toLowerCase().includes(q) ||
          // Business vertical name (Grocery, Pharmacy, Bakery)
          (categoryLookup[s.businessCategoryId] ?? "").toLowerCase().includes(q) ||
          // Store-admin categories (Fruits, Dairy, Snacks...)
          (storeAdminCatMap[s.id] ?? []).some((cat) => cat.toLowerCase().includes(q))
      )
    : stores;

  const filteredProducts = q
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category?.name ?? "").toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          p.storeName.toLowerCase().includes(q)
      )
    : allProducts;

  const filteredCategories = q
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.children?.some((ch) => ch.name.toLowerCase().includes(q))
      )
    : categories;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setActiveTab("stores");
      router.push(`/search?q=${encodeURIComponent(inputVal.trim())}`);
    }
  };

  // Update local input when URL ?q changes
  React.useEffect(() => {
    setInputVal(query);
    if (query) setActiveTab("stores");
  }, [query]);

  const tabs = [
    { id: "categories" as const, label: "Categories", count: filteredCategories.length },
    { id: "stores" as const, label: "Stores", count: filteredStores.length },
    { id: "products" as const, label: "Products", count: filteredProducts.length },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />
      <CategoryNav />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center border-2 border-primary rounded-xl overflow-hidden shadow-lg shadow-primary/10 bg-white dark:bg-neutral-900">
          <div className="pl-4 text-neutral-400">
            <Search size={20} />
          </div>
          <input
            suppressHydrationWarning
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search shops, products, categories…"
            className="flex-1 py-4 px-3 bg-transparent outline-none text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400"
          />
          <button type="submit" className="px-8 py-4 bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors">
            Search
          </button>
        </form>

        {/* Result summary */}
        {query && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing results for <span className="font-bold text-neutral-900 dark:text-white">"{query}"</span>
            {" "}— {filteredStores.length} stores, {filteredProducts.length} products, {filteredCategories.length} categories
          </p>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
            >
              {tab.label}
              {query && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-primary text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Location warning for stores/products */}
        {!lat && activeTab !== "categories" && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-sm text-amber-800 dark:text-amber-300">
            <MapPin size={16} />
            Set your location to discover nearby shops and products.
          </div>
        )}

        {/* ── CATEGORIES TAB ── */}
        {activeTab === "categories" && (
          catsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredCategories.length > 0 ? (
            <CategorySection categories={filteredCategories} />
          ) : (
            <div className="text-center py-16 text-neutral-400">
              <Tag size={36} className="mx-auto mb-3 text-neutral-200 dark:text-neutral-700" />
              <p className="font-bold text-neutral-700 dark:text-neutral-300">No categories match "{query}"</p>
            </div>
          )
        )}

        {/* ── STORES TAB ── */}
        {activeTab === "stores" && lat && (
          storesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <StoreCardSkeleton key={i} />)}
            </div>
          ) : filteredStores.length > 0 ? (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400 font-medium">{filteredStores.length} store{filteredStores.length !== 1 ? "s" : ""} near you</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStores.map((shop) => (
                  <StoreResultCard
                    key={shop.id}
                    shop={shop}
                    categoryName={categoryLookup[shop.businessCategoryId]}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-neutral-500 space-y-2">
              <Store size={40} className="mx-auto text-neutral-200 dark:text-neutral-700" />
              <p className="font-bold text-neutral-800 dark:text-neutral-200">
                {query ? `No stores match "${query}"` : "No stores in your area yet"}
              </p>
              <p className="text-sm">We're expanding! More stores are joining every week.</p>
            </div>
          )
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === "products" && lat && (
          productsLoading || storesLoading ? (
            <div className="space-y-3">
              <div className="h-6 bg-neutral-100 dark:bg-neutral-800 rounded w-48 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-8">
              <p className="text-xs text-neutral-400 font-medium">{filteredProducts.length} products from {storeIds.length} stores</p>
              {/* Group by store-owner category */}
              {Object.entries(
                filteredProducts.reduce<Record<string, EnrichedProduct[]>>((acc, p) => {
                  const key = p.category?.name ?? "Other";
                  (acc[key] ??= []).push(p);
                  return acc;
                }, {})
              ).map(([catName, products]) => (
                <div key={catName} className="space-y-3">
                  <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    <span className="text-base">{getEmoji(catName)}</span>
                    {catName}
                    <span className="text-xs font-normal text-neutral-400">({products.length})</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {products.slice(0, 10).map((p) => (
                      <ProductCard key={`${p.storeId}-${p.id}`} product={p} storeName={p.storeName} storeId={p.storeId} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-neutral-500 space-y-2">
              <ShoppingBag size={40} className="mx-auto text-neutral-200 dark:text-neutral-700" />
              <p className="font-bold text-neutral-800 dark:text-neutral-200">
                {query ? `No products found for "${query}"` : "No products available"}
              </p>
              <p className="text-sm">{query ? "Try a different keyword." : "Set your location to see products."}</p>
            </div>
          )
        )}

      </div>

      <Footer />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
          <Loader2 size={32} className="animate-spin text-primary" />
        </main>
      }
    >
      <SearchInner />
    </Suspense>
  );
}
