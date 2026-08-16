"use client";
// app/(store-owner)/offers/page.tsx
// Offers management page — list, toggle, delete, and create/edit offers.

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  RefreshCw,
  Tag,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { storeOwnerApi, type StoreOffer } from "@/lib/api";
import { OfferFormDrawer } from "@/components/offers/OfferFormDrawer";
import toast from "react-hot-toast";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dt: string | null | undefined) {
  if (!dt) return "∞";
  return new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function OfferTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string }> = {
    PRODUCT_DISCOUNT:      { label: "Product",  color: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" },
    CATEGORY_DISCOUNT:     { label: "Category", color: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300" },
    CART_DISCOUNT:         { label: "Cart",     color: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300" },
    BUY_X_GET_Y_FREE:      { label: "Buy X+Y",  color: "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300" },
    FREE_ITEM_ON_MIN_CART: { label: "Free Item",color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" },
  };
  const cfg = map[type] ?? { label: type, color: "bg-neutral-100 text-neutral-500" };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>;
}

function StatusBadge({ status, isActive }: { status: string; isActive: boolean }) {
  if (!isActive) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-500">Paused</span>;
  const map: Record<string, string> = {
    ACTIVE:  "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
    DRAFT:   "bg-neutral-100 dark:bg-neutral-800 text-neutral-500",
    PAUSED:  "bg-neutral-100 dark:bg-neutral-800 text-neutral-500",
    EXPIRED: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${map[status] ?? "bg-neutral-100 text-neutral-500"}`}>{status}</span>;
}

function formatDiscount(offer: StoreOffer) {
  switch (offer.rewardType) {
    case "PERCENT_OFF":   return `${offer.rewardValue}% off`;
    case "FLAT_OFF":      return `₹${offer.rewardValue} off`;
    case "FREE_ITEM":     return `Free item`;
    case "FREE_SHIPPING": return `Free shipping`;
    default: return "—";
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OffersPage() {
  const queryClient = useQueryClient();
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [editingOffer, setEditingOffer] = useState<StoreOffer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["storeOffers"],
    queryFn: () => storeOwnerApi.listOffers(),
    staleTime: 30_000,
  });

  const offers: StoreOffer[] = data?.offers ?? [];

  const handleToggle = async (offer: StoreOffer) => {
    setTogglingId(offer.id);
    try {
      await storeOwnerApi.toggleOffer(offer.id, !offer.isActive);
      queryClient.invalidateQueries({ queryKey: ["storeOffers"] });
      toast.success(`Offer ${!offer.isActive ? "activated" : "paused"}`);
    } catch {
      toast.error("Failed to update offer status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (offer: StoreOffer) => {
    if (!confirm(`Delete "${offer.title}"? This cannot be undone.`)) return;
    setDeletingId(offer.id);
    try {
      await storeOwnerApi.deleteOffer(offer.id);
      queryClient.invalidateQueries({ queryKey: ["storeOffers"] });
      toast.success("Offer deleted");
    } catch {
      toast.error("Failed to delete offer");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Offers</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Manage discounts and promotions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="p-2 text-neutral-500 hover:text-emerald-500 transition-colors">
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowCreateDrawer(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-900/30"
          >
            <Plus size={14} /> Create Offer
          </button>
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-emerald-500" />
          </div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <Tag size={32} className="mb-2 opacity-30" />
            <p className="text-sm font-semibold">No offers yet</p>
            <p className="text-xs mt-1">Create your first offer to attract more customers</p>
            <button
              onClick={() => setShowCreateDrawer(true)}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              + Create Offer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500">Title</th>
                  <th className="text-left px-3 py-3 font-semibold text-neutral-500">Type</th>
                  <th className="text-left px-3 py-3 font-semibold text-neutral-500">Status</th>
                  <th className="text-left px-3 py-3 font-semibold text-neutral-500">Discount</th>
                  <th className="text-left px-3 py-3 font-semibold text-neutral-500 hidden md:table-cell">Schedule</th>
                  <th className="text-left px-3 py-3 font-semibold text-neutral-500 hidden sm:table-cell">Channels</th>
                  <th className="text-left px-3 py-3 font-semibold text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr
                    key={offer.id}
                    className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <p className="font-semibold text-neutral-900 dark:text-white">{offer.title}</p>
                      {offer.couponCode && (
                        <span className="font-mono text-[10px] text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                          {offer.couponCode}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3"><OfferTypeBadge type={offer.offerType} /></td>
                    <td className="px-3 py-3"><StatusBadge status={offer.status} isActive={offer.isActive} /></td>
                    <td className="px-3 py-3 font-semibold text-neutral-800 dark:text-neutral-200">{formatDiscount(offer)}</td>
                    <td className="px-3 py-3 text-neutral-500 hidden md:table-cell">
                      {formatDate(offer.startsAt)} → {formatDate(offer.endsAt)}
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <div className="flex gap-1">
                        {offer.appliesToApp && <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-[10px] font-bold rounded">App</span>}
                        {offer.appliesToPos && <span className="px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 text-[10px] font-bold rounded">POS</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* Toggle */}
                        <button
                          onClick={() => handleToggle(offer)}
                          disabled={togglingId === offer.id}
                          title={offer.isActive ? "Pause" : "Activate"}
                          className="text-neutral-500 hover:text-emerald-500 transition-colors disabled:opacity-40"
                        >
                          {togglingId === offer.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : offer.isActive ? (
                            <ToggleRight size={18} className="text-emerald-500" />
                          ) : (
                            <ToggleLeft size={18} />
                          )}
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => setEditingOffer(offer)}
                          className="p-1.5 text-neutral-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(offer)}
                          disabled={deletingId === offer.id}
                          className="p-1.5 text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
                        >
                          {deletingId === offer.id ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Drawer */}
      {(showCreateDrawer || editingOffer) && (
        <OfferFormDrawer
          offer={editingOffer}
          onClose={() => { setShowCreateDrawer(false); setEditingOffer(null); }}
          onSaved={() => { setShowCreateDrawer(false); setEditingOffer(null); refetch(); }}
        />
      )}
    </div>
  );
}
