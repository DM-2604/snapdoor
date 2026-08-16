"use client";
// components/offers/OfferFormDrawer.tsx
// Create / Edit offer form drawer for the store-admin Offers page.

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { storeOwnerApi, type StoreOffer, type CreateOfferPayload, type OfferType, type RewardType } from "@/lib/api";

interface Props {
  offer: StoreOffer | null; // null = create mode, non-null = edit mode
  onClose: () => void;
  onSaved: () => void;
}

const OFFER_TYPES: { value: OfferType; label: string; description: string }[] = [
  { value: "PRODUCT_DISCOUNT",       label: "Product Discount",    description: "Discount on specific products" },
  { value: "CATEGORY_DISCOUNT",      label: "Category Discount",   description: "Discount on a product category" },
  { value: "CART_DISCOUNT",          label: "Cart Discount",       description: "Discount when cart reaches min value" },
  { value: "BUY_X_GET_Y_FREE",       label: "Buy X Get Y Free",    description: "Buy quantity X, get reward" },
  { value: "FREE_ITEM_ON_MIN_CART",  label: "Free Item on Cart",   description: "Free item when cart exceeds min" },
];

const REWARD_TYPES: { value: RewardType; label: string }[] = [
  { value: "PERCENT_OFF",  label: "Percent Off (%)" },
  { value: "FLAT_OFF",     label: "Flat Amount Off (₹)" },
  { value: "FREE_ITEM",    label: "Free Item" },
  { value: "FREE_SHIPPING",label: "Free Shipping" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl outline-none focus:border-emerald-500 transition-colors";
const selectCls = `${inputCls} cursor-pointer`;

export function OfferFormDrawer({ offer, onClose, onSaved }: Props) {
  const isEditing = !!offer;
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Form state ────────────────────────────────────────────────────────────
  const [title, setTitle] = useState(offer?.title ?? "");
  const [description, setDescription] = useState(offer?.description ?? "");
  const [offerType, setOfferType] = useState<OfferType>(offer?.offerType ?? "CART_DISCOUNT");
  const [rewardType, setRewardType] = useState<RewardType>(offer?.rewardType ?? "PERCENT_OFF");
  const [rewardValue, setRewardValue] = useState(String(offer?.rewardValue ?? ""));
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(String(offer?.maxDiscountAmount ?? ""));
  const [triggerMinCartValue, setTriggerMinCartValue] = useState(String(offer?.triggerMinCartValue ?? ""));
  const [triggerQuantity, setTriggerQuantity] = useState(String(offer?.triggerQuantity ?? ""));
  const [triggerIsEntireStore, setTriggerIsEntireStore] = useState(offer?.triggerIsEntireStore ?? true);
  const [startsAt, setStartsAt] = useState(
    offer?.startsAt ? offer.startsAt.slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [endsAt, setEndsAt] = useState(offer?.endsAt ? offer.endsAt.slice(0, 16) : "");
  const [couponCode, setCouponCode] = useState(offer?.couponCode ?? "");
  const [requireCoupon, setRequireCoupon] = useState(!!offer?.couponCode);
  const [appliesToPos, setAppliesToPos] = useState(offer?.appliesToPos ?? true);
  const [appliesToApp, setAppliesToApp] = useState(offer?.appliesToApp ?? true);
  const [isActive, setIsActive] = useState(offer?.isActive ?? true);

  // ── Sync fields when offer prop changes (edit mode) ───────────────────────
  useEffect(() => {
    if (!offer) return;
    setTitle(offer.title);
    setDescription(offer.description ?? "");
    setOfferType(offer.offerType);
    setRewardType(offer.rewardType);
    setRewardValue(String(offer.rewardValue ?? ""));
    setMaxDiscountAmount(String(offer.maxDiscountAmount ?? ""));
    setTriggerMinCartValue(String(offer.triggerMinCartValue ?? ""));
    setTriggerQuantity(String(offer.triggerQuantity ?? ""));
    setTriggerIsEntireStore(offer.triggerIsEntireStore);
    setStartsAt(offer.startsAt.slice(0, 16));
    setEndsAt(offer.endsAt?.slice(0, 16) ?? "");
    setCouponCode(offer.couponCode ?? "");
    setRequireCoupon(!!offer.couponCode);
    setAppliesToPos(offer.appliesToPos);
    setAppliesToApp(offer.appliesToApp);
    setIsActive(offer.isActive);
  }, [offer]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    if (!appliesToPos && !appliesToApp) { setError("Select at least one channel"); return; }

    setError(null);
    setIsSaving(true);

    const payload: CreateOfferPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      offerType,
      rewardType,
      rewardValue: rewardValue ? Number(rewardValue) : undefined,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      triggerMinCartValue: triggerMinCartValue ? Number(triggerMinCartValue) : undefined,
      triggerQuantity: triggerQuantity ? Number(triggerQuantity) : undefined,
      triggerIsEntireStore,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      couponCode: requireCoupon && couponCode.trim() ? couponCode.trim().toUpperCase() : undefined,
      appliesToPos,
      appliesToApp,
      isActive,
    };

    try {
      if (isEditing) {
        await storeOwnerApi.updateOffer(offer!.id, payload);
      } else {
        await storeOwnerApi.createOffer(payload);
      }
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Failed to save offer");
    } finally {
      setIsSaving(false);
    }
  };

  const showMinCart = ["CART_DISCOUNT", "FREE_ITEM_ON_MIN_CART"].includes(offerType);
  const showTriggerQty = offerType === "BUY_X_GET_Y_FREE";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 flex flex-col shadow-2xl overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <h2 className="font-black text-neutral-900 dark:text-white">
            {isEditing ? "Edit Offer" : "Create Offer"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Title */}
          <Field label="Title *">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 10% off on all Dairy"
              className={inputCls}
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional customer-facing description"
              rows={2}
              className={inputCls + " resize-none"}
            />
          </Field>

          {/* Offer Type */}
          <Field label="Offer Type *">
            <select value={offerType} onChange={(e) => setOfferType(e.target.value as OfferType)} className={selectCls}>
              {OFFER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label} — {t.description}</option>
              ))}
            </select>
          </Field>

          {/* Trigger section */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Trigger Conditions</h3>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={triggerIsEntireStore}
                onChange={(e) => setTriggerIsEntireStore(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-500"
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Applies to all products in store</span>
            </label>

            {showMinCart && (
              <Field label={`Min cart value (₹)`}>
                <input
                  type="number"
                  min={0}
                  value={triggerMinCartValue}
                  onChange={(e) => setTriggerMinCartValue(e.target.value)}
                  placeholder="e.g. 500"
                  className={inputCls}
                />
              </Field>
            )}

            {showTriggerQty && (
              <Field label="Buy quantity (X)">
                <input
                  type="number"
                  min={1}
                  value={triggerQuantity}
                  onChange={(e) => setTriggerQuantity(e.target.value)}
                  placeholder="e.g. 2"
                  className={inputCls}
                />
              </Field>
            )}
          </div>

          {/* Reward section */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Reward</h3>

            <Field label="Reward Type *">
              <select value={rewardType} onChange={(e) => setRewardType(e.target.value as RewardType)} className={selectCls}>
                {REWARD_TYPES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Field>

            {(rewardType === "PERCENT_OFF" || rewardType === "FLAT_OFF" || rewardType === "FREE_ITEM") && (
              <Field label={rewardType === "PERCENT_OFF" ? "Discount %" : rewardType === "FLAT_OFF" ? "Amount off (₹)" : "Item value (₹)"}>
                <input
                  type="number"
                  min={0}
                  step={rewardType === "PERCENT_OFF" ? "0.1" : "1"}
                  max={rewardType === "PERCENT_OFF" ? 100 : undefined}
                  value={rewardValue}
                  onChange={(e) => setRewardValue(e.target.value)}
                  placeholder={rewardType === "PERCENT_OFF" ? "e.g. 10" : "e.g. 50"}
                  className={inputCls}
                />
              </Field>
            )}

            {rewardType === "PERCENT_OFF" && (
              <Field label="Max discount cap (₹, optional)">
                <input
                  type="number"
                  min={0}
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(e.target.value)}
                  placeholder="e.g. 100"
                  className={inputCls}
                />
              </Field>
            )}
          </div>

          {/* Channels */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl space-y-2">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Applies To</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={appliesToApp} onChange={(e) => setAppliesToApp(e.target.checked)} className="w-4 h-4 rounded accent-emerald-500" />
                <span className="text-sm font-medium">📱 Online Orders</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={appliesToPos} onChange={(e) => setAppliesToPos(e.target.checked)} className="w-4 h-4 rounded accent-emerald-500" />
                <span className="text-sm font-medium">🏪 POS</span>
              </label>
            </div>
          </div>

          {/* Schedule */}
          <Field label="Starts At *">
            <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Ends At (leave blank for forever)">
            <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputCls} />
          </Field>

          {/* Coupon */}
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={requireCoupon} onChange={(e) => setRequireCoupon(e.target.checked)} className="w-4 h-4 rounded accent-emerald-500" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Require a coupon code</span>
            </label>
            {requireCoupon && (
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE30"
                className={inputCls + " font-mono uppercase"}
              />
            )}
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded accent-emerald-500" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Active (live immediately after schedule starts)</span>
          </label>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={(e) => handleSubmit(e as any)}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-md shadow-emerald-900/30"
          >
            {isSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : isEditing ? "Update Offer" : "Create Offer"}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in-right { animation: slide-in-right 0.2s ease-out; }
      `}</style>
    </div>
  );
}
