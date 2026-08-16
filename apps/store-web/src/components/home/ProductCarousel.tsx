"use client";

import Link from "next/link";
import React, { useState } from "react";
import { ChevronRight, Star, Heart } from "lucide-react";
import { useStore } from "@/store/useStore";

export interface Product {
  id?: string | number;
  name: string;
  store: string;
  rating: number;
  price: number;
  originalPrice?: number;
  discount?: string;
  imagePlaceholder?: string;
  emoji?: string;
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
  extraHeader?: React.ReactNode;
  viewAllHref?: string;
}

const ITEMS_PER_PAGE = 6;

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ title, products, extraHeader, viewAllHref }) => {
  const { incrementCart } = useStore();
  const [showAll, setShowAll] = useState(false);

  const categoryParam = encodeURIComponent(title);
  const viewAllLink = viewAllHref ?? `/search?category=${categoryParam}`;

  const displayedProducts = showAll ? products : products.slice(0, ITEMS_PER_PAGE);

  return (
    <div className="w-full px-4 md:px-8 pb-12 relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{title}</h3>
          {extraHeader && <div>{extraHeader}</div>}
        </div>
        <Link href={viewAllLink} className="flex items-center text-sm font-medium text-primary hover:underline shrink-0">
          View All <ChevronRight size={16} />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
        {displayedProducts.map((product, index) => {
          const productId = product.id ?? index + 1;
          return (
            <div key={index} className="min-w-[160px] md:min-w-[190px] bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 hover:shadow-md transition-shadow relative group">
              {/* Wishlist Button */}
              <button
                suppressHydrationWarning
                onClick={(e) => {
                  e.preventDefault();
                  useStore.getState().toggleWishlist(product.name);
                }}
                className="absolute top-3 right-3 text-neutral-400 hover:text-danger z-10 transition-colors"
              >
                <Heart
                  size={16}
                  className={useStore((state) => state.wishlistItems.includes(product.name)) ? "fill-danger text-danger" : ""}
                />
              </button>

              {/* Discount Tag */}
              {product.discount && (
                <div className="absolute top-3 left-3 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                  {product.discount}
                </div>
              )}

              {/* Product Image — clickable to product detail */}
              <Link href={`/product/${productId}`} className="block cursor-pointer">
                <div className="h-28 md:h-32 bg-neutral-50 dark:bg-neutral-950 mb-3 rounded-md flex items-center justify-center text-4xl relative">
                  {product.emoji ? (
                    <span>{product.emoji}</span>
                  ) : (
                    <span className="text-xs text-neutral-400">{product.imagePlaceholder || "🛍️"}</span>
                  )}
                </div>

                {/* Details */}
                <h4 className="font-medium text-sm text-neutral-800 dark:text-neutral-100 mb-1 leading-tight line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
              </Link>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-2 truncate">{product.store}</p>

              <div className="flex items-center gap-1 mb-3">
                <Star size={12} className="text-warning fill-warning" />
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{product.rating}</span>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div>
                  <span className="font-bold text-neutral-800 dark:text-neutral-100">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-[11px] text-neutral-400 line-through ml-1">₹{product.originalPrice}</span>
                  )}
                </div>
                <button
                  suppressHydrationWarning
                  onClick={() => incrementCart(product.name)}
                  className="text-xs font-bold text-primary border border-primary px-3 py-1 rounded hover:bg-primary hover:text-white transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* View More button */}
      {products.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center mt-4">
          <button
            suppressHydrationWarning
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-8 py-2.5 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all text-sm"
          >
            {showAll ? "Show Less" : `View More (${products.length - ITEMS_PER_PAGE} more)`}
            <ChevronRight size={16} className={`transition-transform ${showAll ? "rotate-90" : ""}`} />
          </button>
        </div>
      )}
    </div>
  );
};
