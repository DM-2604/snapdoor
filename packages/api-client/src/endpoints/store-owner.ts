// packages/api-client/src/endpoints/store-owner.ts
// Store Owner (STORE_OWNER role) endpoints — authenticated via httpOnly cookie + proxy

import type { ApiClient } from '../client';

export type StoreStatus = 'DRAFT' | 'PENDING' | 'LIVE' | 'SUSPENDED';
export type DocVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type OfferType = 'PRODUCT_DISCOUNT' | 'CATEGORY_DISCOUNT' | 'CART_DISCOUNT' | 'BUY_X_GET_Y_FREE' | 'FREE_ITEM_ON_MIN_CART';
export type RewardType = 'PERCENT_OFF' | 'FLAT_OFF' | 'FREE_ITEM' | 'FREE_SHIPPING';
export type OfferStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';

export interface StoreOffer {
  id: string;
  title: string;
  description: string | null;
  offerType: OfferType;
  status: OfferStatus;
  isActive: boolean;
  startsAt: string;
  endsAt: string | null;
  rewardType: RewardType;
  rewardValue: number | null;
  maxDiscountAmount: number | null;
  triggerMinCartValue: number | null;
  triggerQuantity: number | null;
  triggerIsEntireStore: boolean;
  couponCode: string | null;
  appliesToPos: boolean;
  appliesToApp: boolean;
  createdAt: string;
}

export interface CreateOfferPayload {
  title: string;
  description?: string;
  offerType: OfferType;
  startsAt: string;
  endsAt?: string;
  isActive?: boolean;
  triggerMinCartValue?: number;
  triggerQuantity?: number;
  triggerIsEntireStore?: boolean;
  triggerProductIds?: string[];
  triggerCategoryIds?: string[];
  rewardType: RewardType;
  rewardValue?: number;
  rewardProductVariantId?: string;
  rewardQuantity?: number;
  maxDiscountAmount?: number;
  maxUsesPerOrder?: number;
  maxUsesTotal?: number;
  couponCode?: string;
  appliesToPos?: boolean;
  appliesToApp?: boolean;
}

export interface PosOrderItem {
  productVariantId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePosOrderPayload {
  items: PosOrderItem[];
  paymentMethod: 'CASH' | 'UPI' | 'CARD';
  customerName?: string;
  customerPhone?: string;
}

export interface PosOrderResult {
  orderId: string;
  orderNumber: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    storeName: string;
    storeAddress: string | null;
    storeGstNumber: string | null;
    customerName: string | null;
    items: Array<{ name: string; quantity: number; unitPrice: number; gstRatePercent: number }>;
    subtotalAmount: number;
    gstAmount: number;
    discountAmount: number;
    totalAmount: number;
    paymentMethod: string;
    createdAt: string;
  };
}

export interface StoreProfile {
  id: string;
  name: string;
  status: StoreStatus;
  description: string | null;
  address: string | null;
  cityId: string | null;
  zoneId: string | null;
  isOpen: boolean;
  isPaused: boolean;
  createdAt: string;
}

export interface StoreOwner {
  id: string;
  userId: string;
  storeId: string;
}

export interface KycStatus {
  storeStatus: StoreStatus;
  documents: Array<{
    docType: string;
    status: DocVerificationStatus;
    fileUrl: string | null;
    rejectionReason: string | null;
  }>;
  requiredDocs: string[];
  allRequiredUploaded: boolean;
}

export interface StoreOwnerDocument {
  id: string;
  docType: string;
  fileUrl: string;
  verificationStatus: DocVerificationStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export interface UpdateStoreProfileDto {
  description?: string;
  address?: string;
  phoneNumber?: string;
}

export interface UploadDocumentDto {
  docType: string;
  fileUrl: string;
  expiresAt?: string;
}

export interface OperatingHours {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

export interface HourException {
  id: string;
  exceptionDate: string;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
  reason: string | null;
}

export interface CreateHourExceptionDto {
  exceptionDate: string; // YYYY-MM-DD
  openTime?: string;
  closeTime?: string;
  isClosed: boolean;
  reason?: string;
}

export interface DocumentUploadUrlDto {
  docType: string;
  fileName: string;
  contentType: string;
}

export interface DocumentUploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

export function createStoreOwnerEndpoints(client: ApiClient) {
  return {
    // ── Profile ────────────────────────────────────────────────────────────────
    getProfile: () =>
      client.get<StoreProfile>('/store/profile'),
    updateProfile: (dto: UpdateStoreProfileDto) =>
      client.patch<StoreProfile>('/store/profile', dto),

    // ── KYC & Documents ────────────────────────────────────────────────────────
    getKycStatus: () => client.get<KycStatus>('/store/kyc-status'),
    listDocuments: () => client.get<StoreOwnerDocument[]>('/store/documents'),

    /** Step 1 of 3: Get a pre-signed Supabase upload URL from the backend */
    getDocumentUploadUrl: (dto: DocumentUploadUrlDto) =>
      client.post<DocumentUploadUrlResponse>('/store/documents/upload-url', dto),

    /** Step 3 of 3: Register the public URL in the database after upload */
    uploadDocument: (dto: UploadDocumentDto) =>
      client.post<StoreOwnerDocument>('/store/documents', dto),

    submitForReview: () =>
      client.post<{ message: string }>('/store/submit-for-review', {}),

    // ── Operating Hours ────────────────────────────────────────────────────────
    getOperatingHours: () =>
      client.get<{ hours: OperatingHours[]; exceptions: HourException[] }>('/store/operating-hours'),
    upsertOperatingHours: (hours: OperatingHours[]) =>
      client.put<{ hours: OperatingHours[]; exceptions: HourException[] }>('/store/operating-hours', { hours }),
    createHourException: (dto: CreateHourExceptionDto) =>
      client.post<HourException>('/store/operating-hours/exceptions', dto),
    deleteHourException: (exceptionId: string) =>
      client.delete<{ success: boolean }>(`/store/operating-hours/exceptions/${exceptionId}`),

    // ── Pause / Resume ─────────────────────────────────────────────────────────
    togglePause: (paused: boolean, reason?: string) =>
      client.post<{ isPaused: boolean }>('/store/toggle-pause', { paused, reason }),

    // ── Products ───────────────────────────────────────────────────────────────
    listProducts: (query?: {
      categoryId?: string;
      isActive?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    }) =>
      client.get<{ items: unknown[]; total: number; page: number }>(
        '/store/products',
        query as Record<string, string | number | undefined>,
      ),
    createProduct: (dto: unknown) => client.post<unknown>('/store/products', dto),
    getProduct: (productId: string) => client.get<unknown>(`/store/products/${productId}`),
    updateProduct: (productId: string, dto: unknown) =>
      client.patch<unknown>(`/store/products/${productId}`, dto),
    deleteProduct: (productId: string) => client.delete<void>(`/store/products/${productId}`),

    // ── Variants ────────────────────────────────────────────────────────────────
    createVariant: (productId: string, dto: {
      name: string; mrp: number; sellingPrice: number;
      sku?: string; initialStockQuantity?: number; lowStockThreshold?: number;
    }) => client.post<any>(`/store/products/${productId}/variants`, dto),
    updateVariant: (productId: string, variantId: string, dto: {
      name?: string; mrp?: number; sellingPrice?: number; sku?: string; isActive?: boolean;
    }) => client.patch<any>(`/store/products/${productId}/variants/${variantId}`, dto),
    deleteVariant: (productId: string, variantId: string) =>
      client.delete<void>(`/store/products/${productId}/variants/${variantId}`),


    // ── Orders ─────────────────────────────────────────────────────────────────
    listOrders: (query?: {
      status?: string;
      channel?: string;
      page?: number;
      limit?: number;
    }) =>
      client.get<{ items: any[]; total: number; page: number; limit: number }>(
        '/store/orders',
        query as Record<string, string | number | undefined>,
      ),
    getOrder: (orderId: string) => client.get<any>(`/store/orders/${orderId}`),
    acceptOrder: (orderId: string) => client.post<any>(`/store/orders/${orderId}/accept`, {}),
    rejectOrder: (orderId: string, reason: string) => client.post<any>(`/store/orders/${orderId}/reject`, { reason }),
    cancelOrder: (orderId: string, reason: string) => client.post<any>(`/store/orders/${orderId}/cancel`, { reason }),
    prepareOrder: (orderId: string) => client.post<any>(`/store/orders/${orderId}/prepare`, {}),
    markReady: (orderId: string) => client.post<any>(`/store/orders/${orderId}/ready`, {}),
    dispatchOrder: (orderId: string, deliveryStaffId?: string) => client.post<any>(`/store/orders/${orderId}/dispatch`, { deliveryStaffId }),
    completeOrder: (orderId: string) => client.post<any>(`/store/orders/${orderId}/complete`, {}),

    // ── Product Categories ──────────────────────────────────────────────────────
    listCategories: () =>
      client.get<{
        businessCategory: { id: string; name: string; iconUrl: string | null; storeId: null };
        myCategories: Array<{
          id: string;
          name: string;
          parentCategoryId: string | null;
          storeId: string;
          isActive: boolean;
          createdAt: string;
        }>;
      }>('/store/categories'),
    createCategory: (dto: { name: string; parentCategoryId: string }) =>
      client.post<{ id: string; name: string; parentCategoryId: string; storeId: string }>('/store/categories', dto),
    deleteCategory: (categoryId: string) =>
      client.delete<{ success: boolean; message: string }>(`/store/categories/${categoryId}`),

    // ── Analytics ────────────────────────────────────────────────────────────
    getAnalytics: (period?: '7d' | '30d' | '90d') =>
      client.get<{
        period: '7d' | '30d' | '90d';
        generatedAt: string;
        kpis: {
          totalOrders: number;
          totalRevenue: number;
          avgOrderValue: number;
          activeProducts: number;
        };
        revenueByDay: Array<{ date: string; isoDate: string; revenue: number; orders: number }>;
        salesByCategory: Array<{
          categoryId: string;
          categoryName: string;
          totalRevenue: number;
          revenueShare: number;
        }>;
        topCustomers: Array<{
          customerId: string | null;
          name: string;
          initials: string;
          orderCount: number;
          totalSpent: number;
        }>;
      }>('/store/analytics', period ? { period } : undefined),

    // ── Invoices ────────────────────────────────────────────────────────────
    listSalesInvoices: (query?: { page?: number; limit?: number }) =>
      client.get<unknown>('/store/invoices/sales', query as Record<string, string | number | undefined>),

    getSalesInvoice: (id: string) =>
      client.get<unknown>(`/store/invoices/sales/${id}`),

    // ── Offers ─────────────────────────────────────────────────────────────
    listOffers: (query?: { status?: OfferStatus; page?: number; limit?: number }) =>
      client.get<{ offers: StoreOffer[]; total: number; page: number; limit: number }>(
        '/store/offers',
        query as Record<string, string | number | undefined>,
      ),
    getOffer: (id: string) =>
      client.get<StoreOffer>(`/store/offers/${id}`),
    createOffer: (dto: CreateOfferPayload) =>
      client.post<StoreOffer>('/store/offers', dto),
    updateOffer: (id: string, dto: Partial<CreateOfferPayload>) =>
      client.patch<StoreOffer>(`/store/offers/${id}`, dto),
    deleteOffer: (id: string) =>
      client.delete<void>(`/store/offers/${id}`),
    toggleOffer: (id: string, isActive: boolean) =>
      client.post<StoreOffer>(`/store/offers/${id}/toggle`, { isActive }),

    // ── POS Billing ────────────────────────────────────────────────────────
    createPosOrder: (dto: CreatePosOrderPayload) =>
      client.post<PosOrderResult>('/store/orders/pos', dto),

    // ── SSE (returns URL string for EventSource constructor) ───────────────
    // Actual backend route: GET /store/orders/stream (via StoreOwnerGuard — store inferred from JWT)
    getOrderStreamUrl: (): string => '/api/proxy/store/orders/stream',
  };
}
