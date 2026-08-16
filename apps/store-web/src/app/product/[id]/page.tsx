"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import {
  Star, Heart, CheckCircle2, Truck, ShieldCheck,
  ShoppingBag, Zap, ChevronRight, Plus, Minus, Loader2,
  AlertCircle, ArrowLeft, Tag, Clock, Store,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { customerApi, MenuProduct, StoreDetails } from "@/lib/customer-api";
import { useCartStore } from "@/stores/cart.store";
import { useUIStore } from "@/stores/ui.store";
import { useRouter } from "next/navigation";

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

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProductDetailSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5">
          <div className="h-80 bg-neutral-100 dark:bg-neutral-800 rounded-2xl" />
        </div>
        <div className="md:col-span-7 space-y-4">
          <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-24" />
          <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded w-3/4" />
          <div className="h-6 bg-neutral-100 dark:bg-neutral-800 rounded w-1/3" />
          <div className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded" />
          <div className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded" />
          <div className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Inner Page ────────────────────────────────────────────────────────────────

function ProductDetailInner() {
  const { id: productId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId") ?? "";
  const router = useRouter();

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [qty, setQty] = useState(1);

  const { addItem } = useCartStore();
  const { toggleWishlist, wishlistItems } = useUIStore();

  // Fetch store details (name, address, etc.)
  const { data: storeDetails } = useQuery<StoreDetails>({
    queryKey: ["store-details", storeId],
    queryFn: () => customerApi.storeDetails(storeId),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch store menu to find this product
  const {
    data: menu,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["store-menu", storeId],
    queryFn: () => customerApi.storeMenu(storeId),
    enabled: !!storeId,
    staleTime: 3 * 60 * 1000,
  });

  // If no storeId in URL, show an error
  if (!storeId) {
    return (
      <div className="text-center py-24 space-y-3">
        <AlertCircle size={40} className="mx-auto text-red-400" />
        <p className="font-bold text-neutral-800 dark:text-neutral-200">Product not found</p>
        <p className="text-sm text-neutral-500">Missing store context. Please go back and try again.</p>
        <button onClick={() => router.back()} className="mt-2 text-primary text-sm font-bold hover:underline flex items-center gap-1 mx-auto">
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>
    );
  }

  const product: MenuProduct | undefined = menu?.items.find((p) => p.id === productId);
  const selectedVariant = product?.variants[selectedVariantIdx];

  const price = selectedVariant?.effectiveSalePrice ?? selectedVariant?.price ?? product?.effectiveSalePrice ?? product?.basePrice ?? 0;
  const originalPrice = selectedVariant?.effectiveSalePrice
    ? selectedVariant.price
    : product?.effectiveSalePrice
    ? product.basePrice
    : null;
  const inStock = selectedVariant?.inStock ?? false;
  const isWishlisted = product ? wishlistItems.includes(product.name) : false;

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addItem({
      storeId,
      productVariantId: selectedVariant.id,
      quantity: qty,
    }, {
      productName: product.name,
      variantName: selectedVariant.variantName,
      price: price ?? 0,
    });
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />
      <CategoryNav />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={12} />
        {storeDetails && (
          <>
            <Link href={`/store/${storeId}`} className="hover:text-primary transition-colors">
              {storeDetails.name}
            </Link>
            <ChevronRight size={12} />
          </>
        )}
        {product?.category && (
          <>
            <Link
              href={`/store/${storeId}?category=${encodeURIComponent(product.category.name)}`}
              className="hover:text-primary transition-colors"
            >
              {product.category.name}
            </Link>
            <ChevronRight size={12} />
          </>
        )}
        <span className="text-neutral-900 dark:text-white font-bold line-clamp-1">
          {product?.name ?? "Product"}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        {isLoading && <ProductDetailSkeleton />}

        {error && (
          <div className="text-center py-24 space-y-3">
            <AlertCircle size={40} className="mx-auto text-red-300" />
            <p className="font-bold text-neutral-800 dark:text-white">Could not load product</p>
            <p className="text-sm text-neutral-500">Check your connection and try again.</p>
          </div>
        )}

        {!isLoading && !error && !product && (
          <div className="text-center py-24 space-y-3">
            <ShoppingBag size={40} className="mx-auto text-neutral-300 dark:text-neutral-700" />
            <p className="font-bold text-neutral-800 dark:text-white">Product not available</p>
            <p className="text-sm text-neutral-500">This product may no longer be listed.</p>
            <Link href={`/store/${storeId}`} className="mt-2 text-primary text-sm font-bold hover:underline flex items-center gap-1 justify-center">
              <Store size={14} /> Browse this store
            </Link>
          </div>
        )}

        {product && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8">

            {/* ── Product Image ─────────────────────────────────────────── */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="relative bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 min-h-[280px] flex items-center justify-center text-7xl group overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getEmoji(product.category?.name)}</span>
                )}

                {/* Sale badge */}
                {product.saleBadgeText && (
                  <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg">
                    {product.saleBadgeText}
                  </span>
                )}

                {/* Out of stock overlay */}
                {!inStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                    <span className="bg-white text-neutral-800 font-bold text-sm px-4 py-2 rounded-xl">Out of Stock</span>
                  </div>
                )}

                {/* Wishlist */}
                <button
                  onClick={() => product && toggleWishlist(product.name)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white dark:bg-neutral-900 shadow border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:text-red-400 transition-colors"
                >
                  <Heart size={16} className={isWishlisted ? "fill-red-400 text-red-400" : "text-neutral-400"} />
                </button>
              </div>

              {/* Additional images */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className="w-16 h-16 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 overflow-hidden"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Info ──────────────────────────────────────────── */}
            <div className="md:col-span-7 space-y-5">
              <div className="space-y-1">
                {product.category && (
                  <span className="text-[11px] font-bold text-primary bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                    {product.category.name}
                  </span>
                )}
                <h1 className="text-2xl font-black text-neutral-900 dark:text-white leading-tight mt-1">
                  {product.name}
                </h1>
                {product.sku && (
                  <p className="text-xs text-neutral-400 font-mono">SKU: {product.sku}</p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800/80">
                <span className="text-3xl font-black text-neutral-900 dark:text-white">₹{price}</span>
                {originalPrice && originalPrice > price && (
                  <span className="text-sm text-neutral-400 line-through">₹{originalPrice}</span>
                )}
                {originalPrice && originalPrice > price && (
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">
                    {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>

              {/* Variants */}
              {product.variants.length > 1 && (
                <div className="space-y-2">
                  <label className="font-bold text-neutral-800 dark:text-neutral-100 text-xs block">
                    Select Variant
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v, idx) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`px-4 py-2.5 rounded-xl border-2 font-bold text-xs transition-all ${
                          selectedVariantIdx === idx
                            ? "border-primary bg-emerald-50 dark:bg-emerald-900/20 text-primary shadow-xs"
                            : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300"
                        } ${!v.inStock ? "opacity-50" : ""}`}
                      >
                        <span>{v.variantName}</span>
                        <span className="block text-[10px] text-neutral-400 font-normal">₹{v.effectiveSalePrice ?? v.price}</span>
                        {!v.inStock && <span className="block text-[9px] text-red-400">Out of stock</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Store info strip */}
              {storeDetails && (
                <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
                  <Store size={16} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-neutral-900 dark:text-white truncate">{storeDetails.name}</p>
                    <p className="text-neutral-500 truncate">{storeDetails.address}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${storeDetails.isOpen ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-500"}`}>
                      {storeDetails.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                </div>
              )}

              {/* Delivery info */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                {[
                  { icon: Clock, label: storeDetails?.avgPrepTimeMinutes ? `${storeDetails.avgPrepTimeMinutes}–${storeDetails.avgPrepTimeMinutes + 10} min` : "Fast delivery", sub: "Estimated time" },
                  { icon: ShieldCheck, label: "Verified Store", sub: "Quality assured" },
                  { icon: Truck, label: storeDetails?.deliveryFee === 0 ? "Free delivery" : storeDetails?.deliveryFee ? `₹${storeDetails.deliveryFee} fee` : "Delivery available", sub: "To your doorstep" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800 text-center">
                    <Icon size={16} className="text-primary mx-auto mb-1" />
                    <p className="font-bold text-neutral-800 dark:text-neutral-100 text-[11px]">{label}</p>
                    <p className="text-neutral-400 text-[10px]">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Qty + Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-xl">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-900 shadow-xs hover:bg-neutral-200 flex items-center justify-center text-neutral-700 dark:text-neutral-300"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-black text-neutral-900 dark:text-white w-6 text-center text-sm">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-900 shadow-xs hover:bg-neutral-200 flex items-center justify-center text-neutral-700 dark:text-neutral-300"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    disabled={!inStock}
                    onClick={handleAddToCart}
                    className="flex-1 sm:px-8 py-3 bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <ShoppingBag size={16} />
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </button>
                  <button
                    disabled={!inStock}
                    onClick={() => { handleAddToCart(); router.push("/checkout"); }}
                    className="flex-1 sm:px-8 py-3 bg-neutral-900 hover:bg-black disabled:opacity-40 text-white font-extrabold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Zap size={16} className="text-amber-400 fill-amber-400" />
                    Buy Now
                  </button>
                </div>
              </div>

              {/* View all products from this store */}
              <Link
                href={`/store/${storeId}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:border-primary hover:text-primary transition-colors"
              >
                <Store size={14} /> View all products from {menu?.storeName}
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
          <Loader2 size={32} className="animate-spin text-primary" />
        </main>
      }
    >
      <ProductDetailInner />
    </Suspense>
  );
}
