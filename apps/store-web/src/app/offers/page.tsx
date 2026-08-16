import { notFound } from 'next/navigation';

export default function DisabledRoute() {
  notFound();
}

/* 
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import {
  Tag,
  Sparkles,
  Clock,
  ShoppingCart,
  Percent,
  ChevronRight,
  Zap,
  Copy,
  Check,
} from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { customerApi, Offer } from "@/lib/customer-api";

function OffersGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div
          key={n}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs animate-pulse space-y-4"
        >
          <div className="h-8 w-8 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-3 w-1/2 bg-neutral-100 dark:bg-neutral-800 rounded" />
          </div>
          <div className="h-8 w-full bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(offer.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeLeft = offer.expiresAt
    ? Math.max(0, Math.floor((new Date(offer.expiresAt).getTime() - Date.now()) / 1000 / 60))
    : null;

  const typeLabels: Record<string, { label: string; cls: string }> = {
    FLAT_DISCOUNT: { label: 'Flat Discount', cls: 'bg-emerald-100 text-emerald-800' },
    PERCENT_DISCOUNT: { label: '% Off', cls: 'bg-blue-100 text-blue-800' },
    BOGO: { label: 'BOGO', cls: 'bg-purple-100 text-purple-800' },
    FREE_DELIVERY: { label: 'Free Delivery', cls: 'bg-amber-100 text-amber-800' },
  };
  const typeStyle = typeLabels[offer.type] ?? { label: offer.type, cls: 'bg-neutral-100 text-neutral-800' };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs hover:border-primary transition-all space-y-4 flex flex-col justify-between group">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <Percent size={20} className="text-primary" />
          </div>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${typeStyle.cls}`}>
            {typeStyle.label}
          </span>
        </div>

        <div>
          <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">{offer.title}</h3>
          <p className="text-[11px] text-primary font-bold mt-0.5">
            {offer.type === 'PERCENT_DISCOUNT'
              ? `${offer.discountValue}% off`
              : `₹${offer.discountValue} off`}
            {offer.minOrderAmount ? ` on orders above ₹${offer.minOrderAmount}` : ''}
          </p>
        </div>

        {timeLeft !== null && (
          <div className="flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg font-bold">
            <Clock size={12} />
            <span>Expires in {timeLeft < 60 ? `${timeLeft}m` : `${Math.floor(timeLeft / 60)}h ${timeLeft % 60}m`}</span>
          </div>
        )}
      </div>

      <button
        onClick={handleCopy}
        className="w-full py-2 border border-primary/40 hover:bg-primary hover:text-white text-primary font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 group-hover:bg-primary group-hover:text-white"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        <span>{copied ? 'Copied!' : 'Copy Code'}</span>
      </button>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-3 text-neutral-400">
      {icon && <span className="text-5xl">{icon}</span>}
      <p className="font-bold text-neutral-600 dark:text-neutral-400 text-sm">{title}</p>
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center max-w-xs">{description}</p>
      )}
      <Link href="/shops" className="mt-2 px-5 py-2 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark transition-colors">
        Browse Stores
      </Link>
    </div>
  );
}

export default function OffersPage() {
  const storeId = useCartStore((s) => s.storeId);

  const { data: offers, isLoading } = useQuery({
    queryKey: ['storeOffers', storeId],
    queryFn: () => customerApi.listStoreOffers(storeId!),
    enabled: !!storeId,
  });

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />

      {/* Breadcrumb * /}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-white font-bold">Offers</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 space-y-8">

        {/* Hero Banner * /}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
              <Zap size={12} className="fill-amber-950" />
              EXCLUSIVE OFFERS
            </span>
            <h1 className="text-2xl md:text-3xl font-black">Store-Exclusive Deals &amp; Discounts</h1>
            <p className="text-xs md:text-sm text-emerald-200">Active offers from the store in your cart. Add more items to unlock better deals.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-center space-y-2 shrink-0">
            <Sparkles size={32} className="mx-auto text-amber-300" />
            <p className="font-bold text-sm text-white">Shop &amp; Save!</p>
          </div>
        </div>

        {/* Offers Content * /}
        {!storeId ? (
          <EmptyState
            icon="🛒"
            title="No store selected"
            description="Browse a store and add items to your cart to see its exclusive offers."
          />
        ) : isLoading ? (
          <OffersGridSkeleton />
        ) : !offers || offers.length === 0 ? (
          <EmptyState
            title="No active offers right now"
            description="Check back later — this store may add new offers soon."
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
                Active Offers ({offers.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </div>
        )}

      </div>

      <Footer />
    </main>
  );
}

*/
