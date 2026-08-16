// packages/api-client/src/index.ts

export { ApiClient } from './client';
export type { ApiClientOptions, ApiResponse } from './client';

export { createAuthEndpoints } from './endpoints/auth';
export { createStoresEndpoints } from './endpoints/stores';
export type { StoreListItem, StoreDetail, PaginatedResponse } from './endpoints/stores';
export { createDocumentsEndpoints } from './endpoints/documents';
export type { Document } from './endpoints/documents';
export { createCategoriesEndpoints } from './endpoints/categories';
export type { Category } from './endpoints/categories';
export { createGeoEndpoints } from './endpoints/geo';
export type { City, Zone } from './endpoints/geo';
export { createAdminEndpoints } from './endpoints/admin';
export type {
  DashboardSummary,
  AuditLog,
  CommissionRule,
  FeePlan,
  PlatformSetting,
} from './endpoints/admin';

export { createStoreOwnerEndpoints } from './endpoints/store-owner';
export type {
  StoreProfile,
  StoreOwner,
  KycStatus,
  StoreOwnerDocument,
  UpdateStoreProfileDto,
  UploadDocumentDto,
  DocumentUploadUrlDto,
  DocumentUploadUrlResponse,
  StoreStatus,
  DocVerificationStatus,
  OperatingHours,
  HourException,
  CreateHourExceptionDto,
  // Phase 3 — Offers & POS
  StoreOffer,
  CreateOfferPayload,
  OfferType,
  RewardType,
  OfferStatus,
  PosOrderItem,
  CreatePosOrderPayload,
  PosOrderResult,
} from './endpoints/store-owner';


export { createCustomerEndpoints } from './endpoints/customer';
export type {
  AddCartItemDto,
  CheckoutDto,
  CartItem,
  CartWithOffers,
  AppliedOffer,
  CheckoutResponse,
  OrderSummary,
  OrderDetail,
  StatusHistoryEntry,
  PaginatedOrders,
  Offer,
} from './endpoints/customer';

