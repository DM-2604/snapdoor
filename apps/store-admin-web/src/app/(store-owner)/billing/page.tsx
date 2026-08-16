"use client";
// app/(store-owner)/billing/page.tsx
// POS Billing terminal — product search/browse, local cart, Bill & Print, Today's Sales panel.

import React, { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  RefreshCw,
  Printer,
  Store,
  LayoutGrid,
  X,
  Receipt,
} from "lucide-react";
import { storeOwnerApi } from "@/lib/api";
import { usePosCartStore } from "@/stores/pos-cart.store";
import { InvoiceReceiptModal, type InvoiceData } from "@/components/billing/InvoiceReceiptModal";
import toast from "react-hot-toast";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(dt: string | null | undefined) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// GST Toggle — commented out: backend does not yet support per-bill GST exclusion.
// When re-enabled, also uncomment setIncludeGst in pos-cart.store.ts and the GST row in cart summary.
//
// function GstToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
//   return (
//     <button
//       onClick={() => onChange(!value)}
//       className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
//         value
//           ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
//           : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500"
//       }`}
//     >
//       <span className={`w-8 h-4 rounded-full transition-all relative ${
//         value ? "bg-blue-500" : "bg-neutral-300 dark:bg-neutral-600"
//       }`}>
//         <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${
//           value ? "left-4" : "left-0.5"
//         }`} />
//       </span>
//       GST {value ? "Included" : "Excluded"}
//     </button>
//   );
// }

// ── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onAdd,
}: {
  product: any;
  onAdd: (variant: { id: string; variantName: string; price: number; gstRatePercent: number }) => void;
}) {
  const variants = product.variants?.filter((v: any) => v.isActive) ?? [];
  const defaultVariant = variants[0];
  const price = defaultVariant
    ? Number(defaultVariant.priceOverride ?? product.basePrice)
    : Number(product.basePrice);

  return (
    <div className="flex items-center justify-between px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl cursor-pointer transition-colors group">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{product.name}</p>
        <p className="text-xs text-neutral-500">₹{price.toFixed(2)}</p>
      </div>
      <button
        disabled={!defaultVariant}
        onClick={() =>
          defaultVariant &&
          onAdd({
            id: defaultVariant.id,
            variantName: defaultVariant.variantName,
            price,
            gstRatePercent: Number(product.gstRatePercent ?? 0),
          })
        }
        className="ml-2 p-1.5 bg-emerald-600 text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-emerald-700 transition-all disabled:opacity-30"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

// ── POS Billing Page ──────────────────────────────────────────────────────────

export default function POSBillingPage() {
  const posCart = usePosCartStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [browseMode, setBrowseMode] = useState(false); // show all products without search
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isBilling, setIsBilling] = useState(false);

  const isSearching = search.length > 1;

  // Product search — fires when search length > 1
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["posProducts", "search", search],
    queryFn: () => storeOwnerApi.listProducts({ search, limit: 30 }),
    enabled: isSearching,
    staleTime: 10_000,
  });

  // Browse all — loads when browseMode is on and not searching
  const { data: browseData, isLoading: browseLoading } = useQuery({
    queryKey: ["posProducts", "browse"],
    queryFn: () => storeOwnerApi.listProducts({ limit: 60, isActive: true }),
    enabled: browseMode && !isSearching,
    staleTime: 60_000,
  });

  // Today's POS sales
  const { data: todayData, refetch: refetchToday } = useQuery({
    queryKey: ["todayPOS"],
    queryFn: () => storeOwnerApi.listOrders({ channel: "POS", limit: 50 }),
    refetchInterval: 60_000,
  });

  const handleBillAndPrint = async () => {
    if (posCart.items.length === 0) return;
    setIsBilling(true);
    try {
      const result = await storeOwnerApi.createPosOrder({
        items: posCart.items.map((i) => ({
          productVariantId: i.productVariantId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        // API PaymentMethod enum: UPI | CARD | COD | PAY_AT_PICKUP
        // "CASH" is not valid — map it to COD (cash-on-delivery / counter cash)
        paymentMethod: (posCart.paymentMethod === "CASH" ? "COD" : posCart.paymentMethod) as any,
        customerName: posCart.customerName || undefined,
        // API field is customerPhoneNumber, not customerPhone
        customerPhoneNumber: posCart.customerPhone || undefined,
      } as any);

      setInvoiceData(result.invoice);
      posCart.clear();
      refetchToday();
      queryClient.invalidateQueries({ queryKey: ["store-orders"] });
      setTimeout(() => window.print(), 400);
    } catch (err: any) {
      const data = err?.response?.data ?? err?.data;
      if (data?.code === "INSUFFICIENT_STOCK") {
        toast.error(`Only ${data.availableQty} in stock for selected item.`);
      } else {
        toast.error(data?.message ?? "Failed to create sale. Please try again.");
      }
    } finally {
      setIsBilling(false);
    }
  };

  const addToCart = (product: any) => (variant: {
    id: string; variantName: string; price: number; gstRatePercent: number;
  }) => {
    posCart.addItem({
      productVariantId: variant.id,
      name: product.name,
      variantLabel: variant.variantName,
      unitPrice: variant.price,
      gstRatePercent: variant.gstRatePercent,
    });
  };

  const subtotal = posCart.getSubtotal();
  const gstAmount = posCart.getGstAmount();
  const totalAmount = posCart.getTotalAmount();

  const activeProducts: any[] = isSearching
    ? ((searchData as any)?.items ?? [])
    : browseMode
    ? ((browseData as any)?.items ?? [])
    : [];
  const isLoadingProducts = isSearching ? searchLoading : browseLoading;
  const showProductPanel = isSearching || browseMode;

  // Today's revenue
  const todayRevenue = ((todayData as any)?.items ?? []).reduce(
    (sum: number, o: any) => sum + Number(o.totalAmount ?? 0),
    0,
  );

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">POS Billing</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Walk-in sales terminal</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-right">
          <p className="text-[11px] text-neutral-500 font-medium">Today's Revenue</p>
          <p className="text-lg font-black text-emerald-500">₹{todayRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Left: Cart + Search ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Product Search + Browse */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); if (e.target.value) setBrowseMode(false); }}
                    placeholder="Search products to add…"
                    className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-sm placeholder:text-neutral-500 outline-none focus:ring-2 ring-emerald-500/30 transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => { setBrowseMode((b) => !b); setSearch(""); }}
                  title="Browse all products"
                  className={`p-2 rounded-xl border transition-all ${
                    browseMode
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-emerald-400 hover:text-emerald-500"
                  }`}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>

            {showProductPanel && (
              <div className="max-h-64 overflow-y-auto p-2">
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center py-6">
                    <RefreshCw size={18} className="animate-spin text-emerald-500" />
                  </div>
                ) : activeProducts.length === 0 ? (
                  <p className="text-center py-6 text-sm text-neutral-500">No products found</p>
                ) : (
                  activeProducts.map((p: any) => (
                    <ProductCard key={p.id} product={p} onAdd={addToCart(p)} />
                  ))
                )}
              </div>
            )}

            {!showProductPanel && (
              <div className="flex items-center gap-3 px-4 py-4 text-xs text-neutral-400">
                <Search size={14} />
                <span>Type to search, or click <LayoutGrid size={12} className="inline mx-1" /> to browse all products</span>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <ShoppingCart size={15} className="text-neutral-500" />
                <span className="font-bold text-sm text-neutral-800 dark:text-white">Cart</span>
                {posCart.items.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                    {posCart.items.length}
                  </span>
                )}
              </div>
              {posCart.items.length > 0 && (
                <button
                  onClick={() => posCart.clear()}
                  className="text-xs text-red-500 hover:text-red-600 font-semibold transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {posCart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
                <ShoppingCart size={32} className="mb-2 opacity-30" />
                <p className="text-sm">Search and add products above</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {posCart.items.map((item) => (
                  <div key={item.productVariantId} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-neutral-500">
                        {item.variantLabel} · ₹{item.unitPrice.toFixed(2)} each
                        {item.gstRatePercent > 0 && (
                          <span className="ml-1 text-blue-500">+{item.gstRatePercent}% GST</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => posCart.updateQuantity(item.productVariantId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => posCart.updateQuantity(item.productVariantId, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                    <span className="w-20 text-right text-sm font-bold text-neutral-900 dark:text-white shrink-0">
                      ₹{(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => posCart.removeItem(item.productVariantId)}
                      className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Cart Summary + Checkout */}
            {posCart.items.length > 0 && (
              <div className="border-t border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
                {/* GST Toggle — disabled until backend supports per-bill GST exclusion */}
                {/* <div className="flex items-center justify-between">
                  <p className="text-xs text-neutral-500">Tax settings</p>
                  <GstToggle value={posCart.includeGst} onChange={posCart.setIncludeGst} />
                </div> */}

                {/* Totals */}
                <div className="space-y-1 text-sm bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {posCart.includeGst && gstAmount > 0 && (
                    <div className="flex justify-between text-blue-600 dark:text-blue-400">
                      <span>GST</span>
                      <span>+₹{gstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {!posCart.includeGst && (
                    <div className="flex justify-between text-neutral-400 text-xs">
                      <span>GST</span>
                      <span>Excluded (B2B)</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-base pt-1.5 border-t border-neutral-200 dark:border-neutral-700">
                    <span>Total</span>
                    <span className="text-emerald-600">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Customer info */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Customer name (optional)"
                    value={posCart.customerName}
                    onChange={(e) => posCart.setCustomer(e.target.value, posCart.customerPhone)}
                    className="px-3 py-2 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 outline-none focus:border-emerald-500 transition-colors"
                  />
                  <input
                    placeholder="Phone (optional)"
                    value={posCart.customerPhone}
                    onChange={(e) => posCart.setCustomer(posCart.customerName, e.target.value)}
                    className="px-3 py-2 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Payment method */}
                <div className="flex gap-2">
                  {(["CASH", "UPI", "CARD"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => posCart.setPaymentMethod(m)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                        posCart.paymentMethod === m
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-900/20"
                          : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-emerald-400"
                      }`}
                    >
                      {m === "CASH" ? "💵 Cash" : m === "UPI" ? "📱 UPI" : "💳 Card"}
                    </button>
                  ))}
                </div>

                {/* Bill & Print */}
                <button
                  onClick={handleBillAndPrint}
                  disabled={isBilling}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all shadow-md shadow-emerald-900/30 disabled:opacity-60"
                >
                  {isBilling ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Printer size={16} />
                  )}
                  {isBilling ? "Processing…" : "Bill & Print"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Today's Sales ── */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Store size={14} className="text-neutral-500" />
              <span className="font-bold text-sm text-neutral-800 dark:text-white">Today's Sales</span>
            </div>
            <button onClick={() => refetchToday()} className="text-neutral-400 hover:text-neutral-700 transition-colors">
              <RefreshCw size={13} />
            </button>
          </div>

          {/* Revenue strip */}
          {(todayData as any)?.items?.length > 0 && (
            <div className="grid grid-cols-2 gap-0 border-b border-neutral-200 dark:border-neutral-800">
              <div className="px-4 py-2.5 border-r border-neutral-200 dark:border-neutral-800">
                <p className="text-[10px] text-neutral-400 font-medium">Sales</p>
                <p className="font-black text-emerald-500 text-sm">
                  {(todayData as any).items.length}
                </p>
              </div>
              <div className="px-4 py-2.5">
                <p className="text-[10px] text-neutral-400 font-medium">Revenue</p>
                <p className="font-black text-emerald-500 text-sm">₹{todayRevenue.toFixed(0)}</p>
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-[55vh]">
            {!todayData || (todayData as any).items?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
                <Receipt size={28} className="mb-2 opacity-30" />
                <p className="text-xs">No POS sales today</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {(todayData as any).items?.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                    onClick={() => order.salesInvoice && setInvoiceData(order.salesInvoice)}
                  >
                    <div>
                      <p className="text-xs font-bold text-emerald-500 font-mono">#{order.orderNumber?.slice(-6)}</p>
                      <p className="text-[10px] text-neutral-400">{formatTime(order.completedAt ?? order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-neutral-900 dark:text-white">₹{Number(order.totalAmount).toFixed(2)}</p>
                      <p className="text-[10px] text-neutral-400">{order.payments?.[0]?.method ?? "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {invoiceData && (
        <InvoiceReceiptModal invoice={invoiceData} onClose={() => setInvoiceData(null)} />
      )}
    </div>
  );
}
