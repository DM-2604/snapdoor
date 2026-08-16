// src/stores/cart.store.ts
// Hybrid cart: local-first for guests (persisted in localStorage), backend-synced when authenticated.
//
// GUEST users:
//   • Items live in Zustand + localStorage (survives page reload, 15-min TTL)
//   • addItem / updateQuantity / removeItem → purely local, zero API calls
//   • Checkout page redirects to auth modal
//   • On login → mergeGuestCart() sends single batch POST /cart/merge
//
// AUTHENTICATED users:
//   • Every mutation hits the backend; response replaces local state
//   • 409 CROSS_STORE_CART_CONFLICT → shows modal to confirm clear & re-add
//   • 409 INSUFFICIENT_STOCK        → clamps item quantity to available
//   • localStorage is cleared once backend becomes source of truth

import { create } from 'zustand';
import { customerApi } from '@/lib/customer-api';
import type { CartItem, CartWithOffers, AppliedOffer, AddCartItemDto, MergeCartResponse } from '@/lib/customer-api';
import { useAuthStore } from '@/stores/auth.store';

export type { CartItem };

export interface CrossStoreConflict {
  existingStoreId: string;
  existingStoreName: string;
  pendingItem: AddCartItemDto;
}

interface CartState {
  // Core state
  items: CartItem[];
  storeId: string | null;
  appliedOffer: AppliedOffer | null;
  totalDiscount: number;
  isLoading: boolean;
  error: string | null;
  crossStoreConflict: CrossStoreConflict | null;

  // UI state
  cartCount: number;
  isCartBouncing: boolean;
  toastMessage: string | null;

  // Actions
  fetchCart: (storeId: string) => Promise<void>;
  addItem: (dto: AddCartItemDto, optimisticData?: { productName: string; variantName: string; price: number }) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  confirmCrossStoreClear: () => Promise<void>;
  dismissConflict: () => void;
  syncFromResponse: (data: CartWithOffers) => void;
  clearToast: () => void;
  /** Called after login — single batch POST /cart/merge, restores on failure */
  mergeGuestCart: () => Promise<void>;
  /** Hydrate from localStorage on app init (guests only) — clears if older than 15 min */
  hydrateFromStorage: () => void;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = 'localmart_guest_cart';
const TTL_MS = 15 * 60 * 1000; // 15 minutes

interface StoredCart {
  items: CartItem[];
  storeId: string | null;
  fetchedAt: number;
}

function saveToStorage(items: CartItem[], storeId: string | null) {
  try {
    if (typeof window === 'undefined') return;
    if (items.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      const data: StoredCart = { items, storeId, fetchedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch { /* ignore quota errors */ }
}

function loadFromStorage(): StoredCart | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredCart;
    // TTL check — stale prices mean nothing without live backend confirmation
    if (Date.now() - (data.fetchedAt ?? 0) > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// ── Local item helpers ────────────────────────────────────────────────────────

function localAddItem(
  items: CartItem[],
  dto: AddCartItemDto,
  opt?: { productName: string; variantName: string; price: number },
): CartItem[] {
  const existing = items.find((i) => i.productVariantId === dto.productVariantId);
  if (existing) {
    return items.map((i) =>
      i.productVariantId === dto.productVariantId
        ? { ...i, quantity: i.quantity + dto.quantity }
        : i,
    );
  }
  const stub: CartItem = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    productVariantId: dto.productVariantId,
    productName: opt?.productName ?? dto.productVariantId,
    variantName: opt?.variantName ?? '',
    priceAtTime: opt?.price ?? 0,
    gstRatePercent: null,
    quantity: dto.quantity,
  };
  return [...items, stub];
}

function localCount(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + i.quantity, 0);
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  storeId: null,
  appliedOffer: null,
  totalDiscount: 0,
  isLoading: false,
  error: null,
  crossStoreConflict: null,
  cartCount: 0,
  isCartBouncing: false,
  toastMessage: null,

  // ── hydrateFromStorage ──────────────────────────────────────────────────────

  hydrateFromStorage: () => {
    const stored = loadFromStorage();
    if (!stored || stored.items.length === 0) return;
    set({
      items: stored.items,
      storeId: stored.storeId,
      cartCount: localCount(stored.items),
    });
  },

  // ── syncFromResponse ────────────────────────────────────────────────────────

  syncFromResponse: (data) => {
    const items = data.cart?.items ?? [];
    set({
      items,
      storeId: data.cart?.storeId ?? null,
      appliedOffer: data.appliedOffer ?? null,
      totalDiscount: data.totalDiscount ?? 0,
      cartCount: localCount(items),
    });
    // Backend is now source of truth — clear guest localStorage
    saveToStorage([], null);
  },

  // ── fetchCart ───────────────────────────────────────────────────────────────

  fetchCart: async (storeId) => {
    set({ isLoading: true });
    try {
      const res = await customerApi.getCart(storeId);
      if (res) get().syncFromResponse(res);
    } catch {
      // 401 = guest or network error — leave current state intact
    } finally {
      set({ isLoading: false });
    }
  },

  // ── addItem ─────────────────────────────────────────────────────────────────

  addItem: async (dto, optimisticData) => {
    const { isAuthenticated } = useAuthStore.getState();

    // ── Guest path: purely local, zero network calls ─────────────────────────
    if (!isAuthenticated) {
      const { items, storeId } = get();

      // Cross-store guard
      if (storeId && storeId !== dto.storeId && items.length > 0) {
        set({
          crossStoreConflict: {
            existingStoreId: storeId,
            existingStoreName: 'another store',
            pendingItem: dto,
          },
        });
        return;
      }

      const nextItems = localAddItem(items, dto, optimisticData);
      set({
        items: nextItems,
        storeId: dto.storeId,
        cartCount: localCount(nextItems),
        isCartBouncing: true,
        toastMessage: 'Added to cart 🛒',
      });
      setTimeout(() => set({ isCartBouncing: false }), 800);
      setTimeout(() => set({ toastMessage: null }), 3000);
      saveToStorage(nextItems, dto.storeId);
      // TODO (Phase 2): enforce stock limit for guest adds
      return;
    }

    // ── Auth path: optimistic + backend sync ────────────────────────────────
    set({ isLoading: true, error: null });
    const prevItems = get().items;
    const prevStoreId = get().storeId;

    // Client-side cross-store guard before hitting backend
    if (prevStoreId && prevStoreId !== dto.storeId && prevItems.length > 0) {
      set({
        isLoading: false,
        crossStoreConflict: {
          existingStoreId: prevStoreId,
          existingStoreName: 'another store',
          pendingItem: dto,
        },
      });
      return;
    }

    const optimisticItems = localAddItem(prevItems, dto, optimisticData);
    set({
      items: optimisticItems,
      storeId: dto.storeId,
      cartCount: localCount(optimisticItems),
      isCartBouncing: true,
      toastMessage: 'Added to cart 🛒',
    });
    setTimeout(() => set({ isCartBouncing: false }), 800);
    setTimeout(() => set({ toastMessage: null }), 3000);

    try {
      const res = await customerApi.addToCart(dto);
      get().syncFromResponse(res);
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: Record<string, unknown>; status?: number } };
      const code = anyErr?.response?.data?.code as string | undefined;
      const status = anyErr?.response?.status ?? 0;

      if (status === 401) {
        // Session expired mid-session — keep optimistic, save locally as fallback
        saveToStorage(optimisticItems, dto.storeId);
      } else if (code === 'CROSS_STORE_CART_CONFLICT') {
        set({
          items: prevItems,
          storeId: prevStoreId,
          cartCount: localCount(prevItems),
          crossStoreConflict: {
            existingStoreId: anyErr.response!.data!.activeStoreId as string ?? prevStoreId ?? '',
            existingStoreName: (anyErr.response!.data!.activeStoreName as string) ?? 'another store',
            pendingItem: dto,
          },
        });
      } else if (code === 'INSUFFICIENT_STOCK') {
        const avail = (anyErr.response!.data!.availableQty as number) ?? 0;
        const clampedItems = get().items.map((i) =>
          i.productVariantId === dto.productVariantId ? { ...i, quantity: avail } : i,
        );
        set({ items: clampedItems, cartCount: localCount(clampedItems) });
      } else {
        set({ items: prevItems, storeId: prevStoreId, cartCount: localCount(prevItems), error: 'Failed to add item' });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  // ── updateQuantity ──────────────────────────────────────────────────────────

  updateQuantity: async (itemId, quantity) => {
    if (quantity <= 0) return get().removeItem(itemId);

    // Optimistic update (works for both guest and auth)
    set((s) => {
      const items = s.items.map((i) => (i.id === itemId ? { ...i, quantity } : i));
      saveToStorage(items, s.storeId);
      return { items, cartCount: localCount(items) };
    });

    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return; // guest — local only

    try {
      const res = await customerApi.updateCartItem(itemId, quantity);
      get().syncFromResponse(res);
    } catch {
      // Keep optimistic on error for smooth UX
    }
  },

  // ── removeItem ──────────────────────────────────────────────────────────────

  removeItem: async (itemId) => {
    set((s) => {
      const items = s.items.filter((i) => i.id !== itemId);
      const newStoreId = items.length === 0 ? null : s.storeId;
      saveToStorage(items, newStoreId);
      return { items, cartCount: localCount(items), storeId: newStoreId };
    });

    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return; // guest — local only

    try {
      await customerApi.removeCartItem(itemId);
    } catch { /* ignore */ }
  },

  // ── clearCart ───────────────────────────────────────────────────────────────

  clearCart: async () => {
    const { storeId } = get();
    set({ items: [], storeId: null, appliedOffer: null, totalDiscount: 0, cartCount: 0 });
    saveToStorage([], null);

    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return; // guest — local only

    try {
      await customerApi.clearCart(storeId ?? undefined);
    } catch { /* ignore */ }
  },

  // ── applyCoupon ─────────────────────────────────────────────────────────────

  applyCoupon: async (code) => {
    const { storeId } = get();
    if (!storeId) return;
    try {
      const res = await customerApi.applyCoupon(storeId, code);
      get().syncFromResponse(res);
    } catch (err) {
      throw err; // re-throw so cart page can show coupon error
    }
  },

  // ── confirmCrossStoreClear ──────────────────────────────────────────────────

  confirmCrossStoreClear: async () => {
    const conflict = get().crossStoreConflict;
    if (!conflict) return;
    set({ crossStoreConflict: null, items: [], storeId: null, appliedOffer: null, totalDiscount: 0, cartCount: 0 });
    saveToStorage([], null);

    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      try { await customerApi.clearCart(conflict.existingStoreId); } catch { /* proceed */ }
    }

    await get().addItem(conflict.pendingItem);
  },

  dismissConflict: () => set({ crossStoreConflict: null }),

  clearToast: () => set({ toastMessage: null }),

  // ── mergeGuestCart ──────────────────────────────────────────────────────────
  /**
   * Called once immediately after login.
   * Reads any guest items from localStorage, sends them as a single atomic
   * POST /cart/merge request, then syncs the server response.
   * Clears localStorage BEFORE the API call to prevent double-merge on retry.
   * Restores localStorage on failure so the user doesn't lose their cart.
   */
  mergeGuestCart: async () => {
    const stored = loadFromStorage();

    if (!stored || !stored.items.length || !stored.storeId) {
      // No guest items — clear stale localStorage and fetch the user's backend cart
      localStorage.removeItem(STORAGE_KEY);
      try {
        const res = await customerApi.getCart();
        if (res) get().syncFromResponse(res);
      } catch {
        // 401 / empty cart — leave state as-is (empty)
      }
      return;
    }

    const raw = localStorage.getItem(STORAGE_KEY)!;

    // Clear BEFORE the API call — prevents double-merge on retry
    localStorage.removeItem(STORAGE_KEY);
    set({ items: [], storeId: null, cartCount: 0 });

    try {
      const res: MergeCartResponse = await customerApi.mergeCart({
        storeId: stored.storeId,
        items: stored.items.map((i) => ({
          productVariantId: i.productVariantId,
          quantity: i.quantity,
        })),
      });
      get().syncFromResponse(res);

      // Toast any items the backend dropped (deleted variants)
      if (res.skippedItems?.length) {
        const nameMap = Object.fromEntries(
          stored.items.map((i) => [i.productVariantId, i.productName]),
        );
        const firstName = nameMap[res.skippedItems[0].productVariantId] ?? 'An item';
        const extra = res.skippedItems.length > 1 ? ` (+${res.skippedItems.length - 1} more)` : '';
        set({ toastMessage: `"${firstName}"${extra} no longer available and was removed from cart.` });
        setTimeout(() => set({ toastMessage: null }), 5000);
      }
    } catch {
      // Restore guest cart on failure — user doesn't lose their items
      localStorage.setItem(STORAGE_KEY, raw);
      set({
        items: stored.items,
        storeId: stored.storeId,
        cartCount: localCount(stored.items),
      });
    }
  },
}));
