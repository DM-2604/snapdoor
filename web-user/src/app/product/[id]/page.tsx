"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import {
  Star,
  Heart,
  Share2,
  CheckCircle2,
  Truck,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
  Zap,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";
import { useStore } from "@/store/useStore";

export default function ProductDetailPage() {
  const router = useRouter();
  const { incrementCart, wishlistItems, toggleWishlist } = useStore();
  const [selectedPack, setSelectedPack] = useState("5 kg");
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState("🌾");

  const product = {
    id: "1",
    name: "Aashirvaad Whole Wheat Atta",
    brand: "Aashirvaad",
    rating: 4.8,
    reviews: "12,450 ratings & 1,230 reviews",
    price: 265,
    originalPrice: 300,
    discount: "12% OFF",
    store: "Gupta Kirana Store",
    storeRating: 4.8,
    deliveryTime: "Delivery in 20-30 min",
    packs: [
      { size: "1 kg", price: 60, orig: 68 },
      { size: "5 kg", price: 265, orig: 300 },
      { size: "10 kg", price: 510, orig: 580 },
    ],
    features: [
      "100% pure whole wheat grain flour",
      "0% maida added",
      "Rich in natural dietary fibre",
      "Sourced directly from MP wheat fields",
    ],
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <Link href="/search" className="hover:text-primary">Grocery & Kirana</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-white font-bold">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Product Gallery */}
          <div className="md:col-span-5 flex flex-col sm:flex-row gap-4">
            <div className="flex sm:flex-col gap-2 shrink-0">
              {["🌾", "🌾", "📦"].map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className="w-14 h-14 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center text-2xl hover:border-primary transition-colors"
                >
                  {img}
                </button>
              ))}
            </div>

            <div className="flex-1 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 min-h-[300px] flex items-center justify-center text-7xl relative group">
              <span>{selectedImage}</span>
              <button 
                onClick={() => toggleWishlist(product.name)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white dark:bg-neutral-900 text-neutral-400 hover:text-danger flex items-center justify-center shadow-xs transition-colors"
              >
                <Heart size={16} className={wishlistItems.includes(product.name) ? "fill-danger text-danger" : ""} />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="md:col-span-7 space-y-5">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-primary bg-emerald-50 px-2 py-0.5 rounded-md">
                {product.brand}
              </span>
              <h1 className="text-2xl font-black text-neutral-900 dark:text-white leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-neutral-800 dark:text-neutral-100">
                  <Star size={12} className="text-warning fill-warning" />
                  <span>{product.rating}</span>
                </div>
                <span>{product.reviews}</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800/80 flex items-baseline gap-3">
              <span className="text-3xl font-black text-neutral-900 dark:text-white">₹{product.price}</span>
              <span className="text-sm text-neutral-400 line-through">₹{product.originalPrice}</span>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                {product.discount}
              </span>
            </div>

            {/* Pack Size Selector */}
            <div className="space-y-2">
              <label className="font-bold text-neutral-800 dark:text-neutral-100 text-xs block">Select Pack Size</label>
              <div className="flex gap-3">
                {product.packs.map((pack) => (
                  <button
                    key={pack.size}
                    onClick={() => setSelectedPack(pack.size)}
                    className={`px-4 py-2.5 rounded-xl border-2 font-bold text-xs transition-all ${
                      selectedPack === pack.size
                        ? "border-primary bg-emerald-50 text-primary shadow-xs"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                    }`}
                  >
                    <span>{pack.size}</span>
                    <span className="block text-[10px] text-neutral-400 font-normal">₹{pack.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-xl">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-900 shadow-2xs hover:bg-neutral-200 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-bold"
                >
                  <Minus size={14} />
                </button>
                <span className="font-black text-neutral-900 dark:text-white w-6 text-center text-sm">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-900 shadow-2xs hover:bg-neutral-200 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-bold"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => incrementCart(product.name)}
                  className="flex-1 sm:px-6 py-3 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <ShoppingBag size={16} />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={() => {
                    incrementCart(product.name);
                    router.push("/checkout");
                  }}
                  className="flex-1 sm:px-6 py-3 bg-neutral-900 hover:bg-black text-white font-extrabold rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  <Zap size={16} className="text-amber-400 fill-amber-400" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
              <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Product Highlights</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600 dark:text-neutral-400">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-primary shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Customer Reviews */}
            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
              <h4 className="font-extrabold text-neutral-900 dark:text-white text-sm">Customer Reviews</h4>
              <div className="flex flex-col gap-4">
                {/* Add Review Box */}
                <div className="bg-neutral-50 dark:bg-neutral-950 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                  <h5 className="font-bold text-neutral-800 dark:text-neutral-100 text-xs mb-2">Write a Review</h5>
                  <div className="flex gap-1 mb-2">
                    {[1,2,3,4,5].map(star => <Star key={star} size={16} className="text-neutral-300 hover:text-warning cursor-pointer transition-colors" />)}
                  </div>
                  <textarea 
                    placeholder="What did you like or dislike?" 
                    className="w-full text-xs p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 mb-2 focus:outline-none focus:border-primary resize-none text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    rows={2}
                  />
                  <button onClick={() => alert("Review submitted for moderation.")} className="px-4 py-2 bg-neutral-900 text-white font-bold rounded-lg text-xs hover:bg-black transition-colors">
                    Submit Review
                  </button>
                </div>
                
                {/* Existing Reviews */}
                <div className="space-y-4">
                  <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        <span>5</span><Star size={10} className="ml-0.5 fill-emerald-700" />
                      </div>
                      <span className="font-bold text-neutral-800 dark:text-neutral-100 text-xs">Excellent Quality</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">Best whole wheat atta. Chapati stays soft for a long time.</p>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                      <span>Ramesh Kumar</span> • <span>Verified Buyer</span> • <span>2 days ago</span>
                    </div>
                  </div>
                  <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        <span>4</span><Star size={10} className="ml-0.5 fill-emerald-700" />
                      </div>
                      <span className="font-bold text-neutral-800 dark:text-neutral-100 text-xs">Good delivery</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">Product is good, delivery was super fast from GreenMart.</p>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                      <span>Priya S.</span> • <span>Verified Buyer</span> • <span>1 week ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
