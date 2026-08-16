// src/lib/customer-api.ts
// Typed fetch wrappers for customer-facing endpoints.
//
// Auth strategy:
//   • Public endpoints (store discovery, categories) → direct to backend
//   • Authenticated endpoints (cart, orders, offers) → /api/customer/* proxy
//     The Next.js proxy reads the store_auth_token httpOnly cookie and adds
//     Authorization: Bearer, so the JWT never touches client JS.

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

// Authenticated proxy route (Next.js handles cookie → Bearer conversion)
const CUSTOMER_PROXY = '/api/customer';

// ── Response unwrapper ────────────────────────────────────────────────────────

async function unwrap<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.message ?? `HTTP ${res.status}`;
    const err = new Error(
      Array.isArray(msg) ? msg.join('; ') : String(msg),
    ) as Error & { response?: { data: Record<string, unknown>; status: number } };
    err.response = { data: json ?? {}, status: res.status };
    throw err;
  }
  // Backend wraps: { data: T, meta: {...} } — fall back to raw json
  return (json?.data ?? json) as T;
}

function buildQs(query?: Record<string, string | number | undefined>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined) params.set(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NearbyStore {
  id: string;
  storeCode: string;
  name: string;
  description: string | null;
  businessCategoryId: string;
  address: string | null;
  photos: string[];
  takeawayEnabled: boolean;
  deliveryEnabled: boolean;
  deliveryRadiusKm: number | null;
  deliveryFee: number | null;
  avgPrepTimeMinutes: number | null;
  distanceKm: number;
  isOpen: boolean;
  location: { lat: number; lng: number };
}

export interface StoreDetails extends NearbyStore {
  businessCategory: { id: string; name: string; iconUrl: string | null };
  operatingHours: Array<{
    dayOfWeek: number;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }>;
}

export interface MenuProduct {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  basePrice: number;
  effectiveSalePrice: number | null;
  saleBadgeText: string | null;
  images: string[];
  category: { id: string; name: string };
  minOrderQty: number;
  variants: Array<{
    id: string;
    variantName: string;
    sku: string;
    price: number;
    effectiveSalePrice: number | null;
    inStock: boolean;
    availableStock: number;
  }>;
}

export interface StoreMenu {
  storeId: string;
  storeName: string;
  avgPrepTimeMinutes: number | null;
  items: MenuProduct[];
}

export interface Category {
  id: string;
  name: string;
  iconUrl: string | null;
  sortOrder: number;
  children: Array<{ id: string; name: string; iconUrl: string | null; sortOrder: number }>;
}

// ── Cart types ────────────────────────────────────────────────────────────────

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

export interface MergeCartResponse extends CartWithOffers {
  skippedItems?: Array<{ productVariantId: string; reason: string }>;
}

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
  payments: Array<{ id?: string; method: string; status: string; amount: number }>;
}

export interface StatusHistoryEntry {
  id: string;
  status: string;  // mapped from toStatus
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

// Maps raw Prisma order shape → frontend OrderSummary / OrderDetail shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeOrder(raw: any): any {
  return {
    ...raw,
    // totalAmount → total
    total: Number(raw.totalAmount ?? raw.total ?? 0),
    // items: productNameSnapshot → productName, unitPriceSnapshot → priceAtTime
    items: (raw.items ?? []).map((item: any) => ({
      ...item,
      productName: item.productNameSnapshot ?? item.productName ?? item.productVariant?.product?.name ?? '',
      priceAtTime: Number(item.unitPriceSnapshot ?? item.priceAtTime ?? 0),
    })),
    // statusHistory: toStatus → status
    statusHistory: (raw.statusHistory ?? []).map((h: any) => ({
      ...h,
      status: h.toStatus ?? h.status ?? '',
    })),
  };
}

export interface Offer {
  id: string;
  title: string;
  type: string;
  discountValue: number;
  minOrderAmount: number | null;
  expiresAt: string | null;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const customerApi = {
  // ── Public: Store Discovery ───────────────────────────────────────────────
  nearbyStores: (lat: number, lng: number): Promise<NearbyStore[]> =>
    fetch(`${API_BASE}/customer/stores/nearby?lat=${lat}&lng=${lng}`, { cache: 'no-store' })
      .then((r) => unwrap<NearbyStore[]>(r)),

  storeDetails: (id: string): Promise<StoreDetails> =>
    fetch(`${API_BASE}/customer/stores/${id}`)
      .then((r) => unwrap<StoreDetails>(r)),

  storeMenu: (id: string): Promise<StoreMenu> =>
    fetch(`${API_BASE}/customer/stores/${id}/menu`)
      .then((r) => unwrap<StoreMenu>(r)),

  categories: (type?: 'vertical'): Promise<Category[]> =>
    fetch(`${API_BASE}/customer/categories${type ? `?type=${type}` : ''}`)
      .then((r) => unwrap<Category[]>(r)),

  // ── Public: Auth (proxied to set httpOnly cookie) ─────────────────────────
  requestOtp: (phoneNumber: string): Promise<Response> =>
    fetch('/api/auth/otp/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    }),

  verifyOtp: (
    phoneNumber: string,
    otp: string,
  ): Promise<{ user: { id: string; phoneNumber: string; name: string | null; role: string } }> =>
    fetch('/api/auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, otp }),
    }).then((r) => r.json()),

  me: (): Promise<{ id: string; phoneNumber: string; name: string | null; role: string } | null> =>
    fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),

  logout: (): Promise<Response> =>
    fetch('/api/auth/logout', { method: 'POST' }),

  // ── Authenticated: Cart (via /api/customer/* proxy) ───────────────────────
  // Backend controller prefix: /cart  (registered under /api/v1/cart)

  getCart: (storeId?: string): Promise<CartWithOffers> =>
    fetch(`${CUSTOMER_PROXY}/cart${buildQs(storeId ? { storeId } : undefined)}`)
      .then((r) => unwrap<CartWithOffers>(r)),

  addToCart: (dto: AddCartItemDto): Promise<CartWithOffers> =>
    fetch(`${CUSTOMER_PROXY}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }).then((r) => unwrap<CartWithOffers>(r)),

  mergeCart: (dto: {
    storeId: string;
    items: Array<{ productVariantId: string; quantity: number }>;
  }): Promise<MergeCartResponse> =>
    fetch(`${CUSTOMER_PROXY}/cart/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }).then((r) => unwrap<MergeCartResponse>(r)),

  updateCartItem: (itemId: string, quantity: number): Promise<CartWithOffers> =>
    fetch(`${CUSTOMER_PROXY}/cart/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    }).then((r) => unwrap<CartWithOffers>(r)),

  removeCartItem: (itemId: string): Promise<void> =>
    fetch(`${CUSTOMER_PROXY}/cart/items/${itemId}`, { method: 'DELETE' })
      .then((r) => unwrap<void>(r)),

  clearCart: (storeId?: string): Promise<void> =>
    fetch(`${CUSTOMER_PROXY}/cart${buildQs({ storeId })}`, { method: 'DELETE' })
      .then((r) => unwrap<void>(r)),

  applyCoupon: (storeId: string, couponCode: string): Promise<CartWithOffers> =>
    fetch(`${CUSTOMER_PROXY}/cart/apply-coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, couponCode }),
    }).then((r) => unwrap<CartWithOffers>(r)),

  // ── Authenticated: Checkout ───────────────────────────────────────────────
  checkout: (dto: CheckoutDto, idempotencyKey: string): Promise<CheckoutResponse> =>
    fetch(`${CUSTOMER_PROXY}/cart/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'idempotency-key': idempotencyKey,
      },
      body: JSON.stringify(dto),
    }).then((r) => unwrap<CheckoutResponse>(r)),

  confirmPayment: (paymentId: string, mockToken: string): Promise<void> =>
    fetch(`${CUSTOMER_PROXY}/payments/${paymentId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mockToken }),
    }).then((r) => unwrap<void>(r)),

  // ── Authenticated: Orders (proxy: /api/customer/customer/orders → /api/v1/customer/orders) ────────
  listOrders: (query?: { status?: string; page?: number; limit?: number }): Promise<PaginatedOrders> =>
    fetch(`${CUSTOMER_PROXY}/customer/orders${buildQs(query as Record<string, string | number | undefined>)}`)
      .then((r) => unwrap<PaginatedOrders>(r))
      .then((data) => ({ ...data, orders: data.orders.map(normalizeOrder) })),

  getOrder: (orderId: string): Promise<OrderDetail> =>
    fetch(`${CUSTOMER_PROXY}/customer/orders/${orderId}`)
      .then((r) => unwrap<OrderDetail>(r))
      .then(normalizeOrder),

  cancelOrder: (orderId: string, reason: string): Promise<void> =>
    fetch(`${CUSTOMER_PROXY}/customer/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    }).then((r) => unwrap<void>(r)),

  reorder: (orderId: string): Promise<{ storeId: string }> =>
    fetch(`${CUSTOMER_PROXY}/customer/orders/${orderId}/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).then((r) => unwrap<{ storeId: string }>(r)),

  // ── Authenticated: Offers ─────────────────────────────────────────────────
  listStoreOffers: (storeId: string): Promise<Offer[]> =>
    fetch(`${CUSTOMER_PROXY}/stores/${storeId}/offers`)
      .then((r) => unwrap<Offer[]>(r)),
};
