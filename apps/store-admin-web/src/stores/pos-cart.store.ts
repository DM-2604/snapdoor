// stores/pos-cart.store.ts
// Isolated Zustand store for the POS billing terminal.
// Completely separate from the customer cart store — no shared state.

import { create } from "zustand";

export interface PosCartItem {
  productVariantId: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  gstRatePercent: number;
  quantity: number;
}

interface PosCartState {
  // State
  items: PosCartItem[];
  customerName: string;
  customerPhone: string;
  paymentMethod: "CASH" | "UPI" | "CARD";
  includeGst: boolean;

  // Computed getters (as regular functions — Zustand doesn't support class getters)
  getSubtotal: () => number;
  getGstAmount: () => number;
  getTotalAmount: () => number;

  // Actions
  addItem: (item: Omit<PosCartItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
  setCustomer: (name: string, phone: string) => void;
  setPaymentMethod: (method: "CASH" | "UPI" | "CARD") => void;
  setIncludeGst: (include: boolean) => void;
}

export const usePosCartStore = create<PosCartState>((set, get) => ({
  items: [],
  customerName: "",
  customerPhone: "",
  paymentMethod: "CASH",
  includeGst: true,

  getSubtotal: () =>
    get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

  getGstAmount: () => {
    if (!get().includeGst) return 0;
    return get().items.reduce(
      (sum, i) => sum + (i.unitPrice * i.quantity * i.gstRatePercent) / 100,
      0,
    );
  },

  getTotalAmount: () => get().getSubtotal() + get().getGstAmount(),

  addItem: (incoming) => {
    const q = incoming.quantity ?? 1;
    set((state) => {
      const existing = state.items.find(
        (i) => i.productVariantId === incoming.productVariantId,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productVariantId === incoming.productVariantId
              ? { ...i, quantity: i.quantity + q }
              : i,
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { ...incoming, quantity: q },
        ],
      };
    });
  },

  updateQuantity: (variantId, quantity) => {
    if (quantity <= 0) {
      set((state) => ({
        items: state.items.filter((i) => i.productVariantId !== variantId),
      }));
    } else {
      set((state) => ({
        items: state.items.map((i) =>
          i.productVariantId === variantId ? { ...i, quantity } : i,
        ),
      }));
    }
  },

  removeItem: (variantId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productVariantId !== variantId),
    })),

  clear: () =>
    set({
      items: [],
      customerName: "",
      customerPhone: "",
      paymentMethod: "CASH",
      includeGst: true,
    }),

  setCustomer: (name, phone) => set({ customerName: name, customerPhone: phone }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  setIncludeGst: (include) => set({ includeGst: include }),
}));
