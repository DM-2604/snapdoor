// packages/api-client/src/endpoints/customer.ts
// Customer-facing endpoints: cart, checkout, orders, offers.

import type { ApiClient } from '../client';

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface AddCartItemDto {
  storeId: string;
  productVariantId: string;
  quantity: number;
}

export interface CheckoutDto {
  storeId: string;
  fulfillmentType: 'TAKEAWAY' | 'STORE_DELIVERY' | 'PLATFORM_DELIVERY';
  paymentMethod: 'UPI' | 'CARD' | 'PAY_AT_PICKUP';
  customerContact: {
    name: string;
    phone: string;
    addressLine?: string;
  };
  couponCode?: string;
}

// ── Response types ────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  productVariantId: string;
  productName: string;
  variantName: string;
  priceAtTime: number;
  gstRatePercent: number | null;
  quantity: number;
}

export interface AppliedOffer {
  id: string;
  title: string;
  discountAmount: number;
}

export interface CartWithOffers {
  cart: {
    id: string;
    storeId: string | null;
    items: CartItem[];
  };
  appliedOffer: AppliedOffer | null;
  totalDiscount: number;
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  paymentId: string;
  requiresPayment: boolean;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  fulfillmentType: string;
  createdAt: string;
  total: number;
  store: { id: string; name: string };
  items: Array<{ id: string; productName: string; quantity: number; priceAtTime: number }>;
  payments: Array<{ id: string; method: string; status: string; amount: number }>;
}

export interface StatusHistoryEntry {
  id: string;
  status: string;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  statusHistory: StatusHistoryEntry[];
}

export interface PaginatedOrders {
  orders: OrderSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface Offer {
  id: string;
  title: string;
  type: string;
  discountValue: number;
  minOrderAmount: number | null;
  expiresAt: string | null;
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createCustomerEndpoints(client: ApiClient) {
  return {
    // ── Cart ──────────────────────────────────────────────
    getCart: (storeId: string) =>
      client.get<CartWithOffers>('/customer/cart', { storeId }),

    addToCart: (dto: AddCartItemDto) =>
      client.post<CartWithOffers>('/customer/cart/items', dto),
      // 409 CROSS_STORE_CART_CONFLICT → { code, existingStoreId }
      // 409 INSUFFICIENT_STOCK → { code, variantId, availableQty, requestedQty }

    updateCartItem: (itemId: string, quantity: number) =>
      client.patch<CartWithOffers>(`/customer/cart/items/${itemId}`, { quantity }),

    removeCartItem: (itemId: string) =>
      client.delete<void>(`/customer/cart/items/${itemId}`),

    clearCart: (storeId?: string) =>
      client.delete<void>('/customer/cart'),

    applyCoupon: (storeId: string, couponCode: string) =>
      client.post<CartWithOffers>('/customer/cart/apply-coupon', { storeId, couponCode }),

    // ── Checkout ──────────────────────────────────────────
    // idempotencyKey: caller generates crypto.randomUUID() once per checkout attempt
    checkout: (dto: CheckoutDto, idempotencyKey: string) =>
      client.post<CheckoutResponse>('/orders/checkout', dto, { idempotencyKey }),

    // Called only for UPI/CARD — not for PAY_AT_PICKUP
    confirmPayment: (paymentId: string, mockToken: string) =>
      client.post<void>(`/payments/${paymentId}/confirm`, { mockToken }),

    // ── Orders ────────────────────────────────────────────
    listOrders: (query?: { status?: string; page?: number; limit?: number }) =>
      client.get<PaginatedOrders>('/customer/orders', query as Record<string, string | number | undefined>),

    getOrder: (orderId: string) =>
      client.get<OrderDetail>(`/customer/orders/${orderId}`),

    cancelOrder: (orderId: string, reason: string) =>
      client.post<void>(`/customer/orders/${orderId}/cancel`, { reason }),

    reorder: (orderId: string) =>
      client.post<{ storeId: string }>(`/customer/orders/${orderId}/reorder`, {}),

    // ── Offers ────────────────────────────────────────────
    // Requires active storeId from cart context
    listStoreOffers: (storeId: string) =>
      client.get<Offer[]>(`/customer/stores/${storeId}/offers`),
  };
}
