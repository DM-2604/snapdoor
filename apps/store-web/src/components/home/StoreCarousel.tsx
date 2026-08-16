'use client';

import React from "react";
import Link from "next/link";
import { ChevronRight, Star, Clock, MapPin, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocationStore } from "@/stores/location.store";
import { customerApi, NearbyStore } from "@/lib/customer-api";

// Category emoji fallback mapping
const CATEGORY_EMOJI: Record<string, string> = {
  kirana: '🏪',
  grocery: '🛒',
  pharmacy: '💊',
  medical: '💊',
  bakery: '🍞',
  dairy: '🥛',
  electronics: '🎧',
  clothing: '👕',
  fashion: '👗',
  stationery: '📚',
  vegetables: '🥦',
  fruits: '🍎',
  default: '🏬',
};

function getCategoryEmoji(categoryName?: string): string {
  if (!categoryName) return CATEGORY_EMOJI.default;
  const lower = categoryName.toLowerCase();
  const key = Object.keys(CATEGORY_EMOJI).find((k) => lower.includes(k));
  return key ? CATEGORY_EMOJI[key] : CATEGORY_EMOJI.default;
}

// Skeleton card for loading state
function StoreCardSkeleton() {
  return (
    <div className="min-w-[260px] md:min-w-[280px] bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="h-36 bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse w-1/2" />
        <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse w-2/3" />
      </div>
    </div>
  );
}

export const StoreCarousel = () => {
  const { lat, lng, address } = useLocationStore();

  const { data: stores, isLoading, error } = useQuery<NearbyStore[]>({
    queryKey: ['nearby-stores', lat, lng],
    queryFn: () => customerApi.nearbyStores(lat!, lng!),
    enabled: lat !== null && lng !== null,
    staleTime: 5 * 60 * 1000, // 5 min
  });

  return (
    <div className="w-full px-4 md:px-8 pb-12 relative">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">Shops Near You</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Based on your location:{" "}
            <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[200px] inline-block align-bottom">
              {address || 'Set your location to see nearby stores'}
            </span>
          </p>
        </div>
        <Link href="/shops" className="flex items-center text-sm font-medium text-primary hover:underline">
          View All Shops <ChevronRight size={16} />
        </Link>
      </div>

      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
        {/* Loading state */}
        {isLoading && (
          <>
            {[1, 2, 3, 4].map((i) => <StoreCardSkeleton key={i} />)}
          </>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400 py-8 px-4">
            <AlertCircle size={18} className="text-red-400" />
            <span>Could not load nearby stores. Check your connection.</span>
          </div>
        )}

        {/* No location set */}
        {!lat && !isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-8 min-w-[300px] bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <MapPin size={32} className="text-primary/40" />
            <div className="text-center">
              <p className="font-bold text-neutral-700 dark:text-neutral-300 text-sm">Set your location</p>
              <p className="text-xs text-neutral-400 mt-1">We'll show stores that can deliver to you</p>
            </div>
          </div>
        )}

        {/* Stores list */}
        {stores && stores.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-8 min-w-[300px] bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <span className="text-4xl">😔</span>
            <div className="text-center">
              <p className="font-bold text-neutral-700 dark:text-neutral-300 text-sm">No stores nearby</p>
              <p className="text-xs text-neutral-400 mt-1">We're expanding! Check back soon.</p>
            </div>
          </div>
        )}

        {stores && stores.map((store) => (
          <Link
            key={store.id}
            href={`/store/${store.id}`}
            className="min-w-[260px] md:min-w-[280px] bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden cursor-pointer hover:shadow-md transition-all group block"
          >
            {/* Image / Emoji Placeholder */}
            <div className="h-36 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 relative flex items-center justify-center">
              <span className="text-6xl">{getCategoryEmoji()}</span>
              {store.deliveryRadiusKm && (
                <div className="absolute bottom-2 left-2 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700">
                  📦 Delivers within {store.deliveryRadiusKm} km
                </div>
              )}
              {store.deliveryFee === 0 && (
                <div className="absolute bottom-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                  FREE delivery
                </div>
              )}
            </div>

            {/* Store Details */}
            <div className="p-4">
              <h4 className="font-bold text-neutral-800 dark:text-neutral-100 mb-1 group-hover:text-primary transition-colors">{store.name}</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-1">
                {store.description || 'Local store'}
              </p>

              <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span>{store.distanceKm.toFixed(1)} km</span>
                </div>
                {store.avgPrepTimeMinutes && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-neutral-300" />
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{store.avgPrepTimeMinutes}-{store.avgPrepTimeMinutes + 10} min</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-xs font-medium">
                {store.isOpen ? (
                  <span className="text-emerald-600 dark:text-emerald-400">● Open</span>
                ) : (
                  <span className="text-red-500">● Closed</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Right Scroll Arrow (Desktop) */}
      <button className="hidden md:flex absolute right-4 top-1/2 translate-y-4 w-10 h-10 bg-white dark:bg-neutral-900 shadow-lg border border-neutral-100 dark:border-neutral-800 rounded-full items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-primary z-10">
        <ChevronRight size={24} />
      </button>
    </div>
  );
};
