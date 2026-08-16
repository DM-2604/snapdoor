"use client";

import React, { useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { customerApi, MenuProduct } from "@/lib/customer-api";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import {
  MapPin, Clock, Star, ChevronLeft, Plus, Minus, ShoppingBag, Loader2, Package
} from "lucide-react";
import Link from "next/link";

// ── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  product,
  storeName,
  storeId,
  avgPrepTime,
}: {
  product: MenuProduct;
  storeName: string;
  storeId: string;
  avgPrepTime: number | null;
}) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const mainVariant = product.variants[0];
  const effectivePrice = mainVariant?.effectiveSalePrice ?? mainVariant?.price ?? product.effectiveSalePrice ?? product.basePrice;
  const basePrice = mainVariant?.price ?? product.basePrice;
  const isOnSale = effectivePrice < basePrice;

  const cartItem = items.find((i) => i.productVariantId === (mainVariant?.id ?? product.id));
  const qty = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    addItem({
      storeId,
      productVariantId: mainVariant?.id ?? product.id,
      quantity: 1,
    }, {
      productName: product.name,
      variantName: mainVariant?.variantName ?? '',
      price: effectivePrice,
    });
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-md transition-all">
      {/* Product Image — links to detail */}
      <Link href={`/product/${product.id}?storeId=${storeId}`} className="block">
        <div className="h-40 bg-neutral-50 dark:bg-neutral-800 relative flex items-center justify-center">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-4" />
          ) : (
            <Package size={48} className="text-neutral-300" />
          )}
          {product.saleBadgeText && (
            <div className="absolute top-2 left-2 bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {product.saleBadgeText}
            </div>
          )}
          {mainVariant && !mainVariant.inStock && (
            <div className="absolute inset-0 bg-white/70 dark:bg-neutral-900/70 flex items-center justify-center">
              <span className="text-xs font-bold text-neutral-500">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="p-3">
        <Link href={`/product/${product.id}?storeId=${storeId}`} className="hover:text-primary transition-colors">
          <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 leading-tight mb-1 line-clamp-2">
            {product.name}
          </h4>
        </Link>
        {mainVariant?.variantName && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{mainVariant.variantName}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-base font-bold text-neutral-900 dark:text-white">₹{effectivePrice}</span>
            {isOnSale && (
              <span className="text-xs text-neutral-400 line-through ml-1">₹{basePrice}</span>
            )}
          </div>

          {/* Quantity control */}
          {qty > 0 ? (
            <div className="flex items-center gap-2 bg-primary rounded-lg overflow-hidden">
              <button
                onClick={() => qty === 1 ? removeItem(cartItem!.id) : updateQuantity(cartItem!.id, qty - 1)}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-white font-bold text-sm min-w-[16px] text-center">{qty}</span>
              <button
                onClick={handleAdd}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={mainVariant && !mainVariant.inStock}
              className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-40"
            >
              <Plus size={12} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
function StoreDetailInner() {
  const { storeId } = useParams<{ storeId: string }>();
  const searchParams = useSearchParams();
  // Pre-select category from URL ?category=Dairy (set by product breadcrumb deep-link)
  const [activeCategory, setActiveCategory] = useState<string>(
    searchParams.get('category') ?? 'All'
  );

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["store", storeId],
    queryFn: () => customerApi.storeDetails(storeId),
    enabled: !!storeId,
  });

  const { data: menu, isLoading: menuLoading } = useQuery({
    queryKey: ["store-menu", storeId],
    queryFn: () => customerApi.storeMenu(storeId),
    enabled: !!storeId,
  });

  const { cartCount, items, storeId: cartStoreId } = useCartStore();
  const storeCartCount = cartStoreId === storeId
    ? items.reduce((a: number, i: { quantity: number }) => a + i.quantity, 0)
    : 0;


  // Collect unique categories from menu
  const categories = menu
    ? ["All", ...Array.from(new Set(menu.items.map((p) => p.category.name)))]
    : ["All"];

  const filteredProducts = menu?.items.filter(
    (p) => activeCategory === "All" || p.category.name === activeCategory,
  ) ?? [];

  const isLoading = storeLoading || menuLoading;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white dark:bg-neutral-900">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
        <Footer />
      </main>
    );
  }

  if (!store) {
    return (
      <main className="min-h-screen bg-white dark:bg-neutral-900">
        <Header />
        <div className="text-center py-32 text-neutral-500">
          <p>Store not found or not available in your area.</p>
          <Link href="/" className="text-primary mt-4 inline-block hover:underline">← Back to home</Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />

      {/* Store Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <Link href="/" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-primary mb-4 transition-colors">
            <ChevronLeft size={16} /> Back
          </Link>

          <div className="flex items-start gap-6">
            {/* Store Image */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
              {store.photos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={store.photos[0]} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag size={40} className="text-neutral-300" />
              )}
            </div>

            {/* Store Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{store.name}</h1>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${store.isOpen ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                  {store.isOpen ? "Open" : "Closed"}
                </span>
              </div>
              {store.description && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">{store.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                {store.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary" />
                    <span>{store.address}</span>
                  </div>
                )}
                {store.avgPrepTimeMinutes && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" />
                    <span>{store.avgPrepTimeMinutes} min delivery</span>
                  </div>
                )}
                {store.deliveryRadiusKm && (
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="text-primary" />
                    <span>Delivers within {store.deliveryRadiusKm} km</span>
                  </div>
                )}
                {store.deliveryFee !== null && store.deliveryFee !== undefined && (
                  <span className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-full">
                    ₹{store.deliveryFee} delivery fee
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tab Bar */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex gap-6 overflow-x-auto no-scrollbar py-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 text-sm font-semibold pb-1 border-b-2 transition-colors ${
                  activeCategory === cat
                    ? "border-primary text-primary"
                    : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-neutral-400">
            <Package size={48} className="mx-auto mb-4 text-neutral-300" />
            <p>No products in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                storeName={store.name}
                storeId={storeId}
                avgPrepTime={store.avgPrepTimeMinutes}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky Cart Bar */}
      {storeCartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-20">
          <div className="max-w-md mx-auto">
            <Link
              href="/cart"
              className="flex items-center justify-between bg-primary text-white px-6 py-4 rounded-2xl shadow-xl shadow-primary/30 hover:bg-primary-dark transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {storeCartCount}
                </span>
                <span className="font-bold">View Cart</span>
              </div>
              <span className="text-sm font-medium">Proceed →</span>
            </Link>
          </div>
        </div>
      )}

      <div className={storeCartCount > 0 ? "pb-24" : ""}>
        <Footer />
      </div>
    </main>
  );
}

export default function StoreDetailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white dark:bg-neutral-900">
        <Header />
        <div className="flex items-center justify-center py-32">
          <span className="animate-spin text-primary">⟳</span>
        </div>
        <Footer />
      </main>
    }>
      <StoreDetailInner />
    </Suspense>
  );
}
