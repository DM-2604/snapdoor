/**
 * @localmart/shared — Enums
 *
 * These are the canonical TypeScript representations of every PostgreSQL enum
 * defined in the v3 schema. They are the single source of truth used across:
 *   - apps/api  (NestJS backend)
 *   - apps/web-admin (Next.js)
 *   - React Native app (future)
 *
 * Values must stay in sync with prisma/schema.prisma enum definitions.
 */

// ─── Identity ─────────────────────────────────────────────────────────────────

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  STORE_OWNER = 'STORE_OWNER',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  ADMIN = 'ADMIN',
}

export enum AuthProvider {
  PHONE_OTP = 'PHONE_OTP',
  GOOGLE = 'GOOGLE',
}

export enum KycStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPS = 'OPS',
  SUPPORT = 'SUPPORT',
  FINANCE = 'FINANCE',
}

export enum OtpPurpose {
  LOGIN = 'LOGIN',
  STORE_OWNER_ONBOARDING = 'STORE_OWNER_ONBOARDING',
  PAYOUT_VERIFICATION = 'PAYOUT_VERIFICATION',
}

export enum DevicePlatform {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  WEB = 'WEB',
}

export enum DocumentOwnerType {
  STORE_OWNER = 'STORE_OWNER',
  STORE = 'STORE',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  ADMIN = 'ADMIN',
}

export enum DocType {
  PAN = 'PAN',
  GST_CERTIFICATE = 'GST_CERTIFICATE',
  SHOP_LICENSE = 'SHOP_LICENSE',
  AADHAAR = 'AADHAAR',
  BANK_PROOF = 'BANK_PROOF',
  VEHICLE_RC = 'VEHICLE_RC',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  PROFILE_PHOTO = 'PROFILE_PHOTO',
  OTHER = 'OTHER',
}

export enum DocumentVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum PayoutAccountOwnerType {
  STORE = 'STORE',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
}

export enum PayoutAccountType {
  BANK = 'BANK',
  UPI = 'UPI',
}

export enum PayoutVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
}

// ─── Geography ────────────────────────────────────────────────────────────────

export enum CityStatus {
  PLANNED = 'PLANNED',
  PILOT = 'PILOT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  INACTIVE = 'INACTIVE',
}

// ─── Platform Config ──────────────────────────────────────────────────────────

export enum PlatformFeePlanType {
  FLAT_MONTHLY = 'FLAT_MONTHLY',
  COMMISSION_BASED = 'COMMISSION_BASED',
  HYBRID = 'HYBRID',
}

export enum BillingFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED',
}

// ─── Store & Catalog ──────────────────────────────────────────────────────────

export enum StoreStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  LIVE = 'LIVE',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
}

export enum OnboardingSource {
  SELF_SERVE = 'SELF_SERVE',
  ASSISTED_FIELD_AGENT = 'ASSISTED_FIELD_AGENT',
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export enum InventoryAdjustmentReason {
  SALE = 'SALE',
  RESTOCK = 'RESTOCK',
  MANUAL = 'MANUAL',
  CORRECTION = 'CORRECTION',
  ORDER_CANCELLED_RELEASE = 'ORDER_CANCELLED_RELEASE',
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export enum CartStatus {
  ACTIVE = 'ACTIVE',
  CONVERTED = 'CONVERTED',
  ABANDONED = 'ABANDONED',
}

export enum FulfillmentType {
  TAKEAWAY = 'TAKEAWAY',
  STORE_DELIVERY = 'STORE_DELIVERY',
  PLATFORM_DELIVERY = 'PLATFORM_DELIVERY', // Phase 2 — dormant
}

export enum OrderChannel {
  APP = 'APP',
  POS = 'POS',
}

export enum OrderStatus {
  PLACED = 'PLACED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PREPARING = 'PREPARING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  UPI = 'UPI',
  CARD = 'CARD',
  COD = 'COD',
  PAY_AT_PICKUP = 'PAY_AT_PICKUP',
}

export enum RefundStatus {
  INITIATED = 'INITIATED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export enum PaymentStatus {
  INITIATED = 'INITIATED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentGatewayMethod {
  UPI = 'UPI',
  CARD = 'CARD',
  COD = 'COD',
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  INITIATED = 'INITIATED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// ─── Notifications ────────────────────────────────────────────────────────────

export enum NotificationChannel {
  PUSH = 'PUSH',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

export enum NotificationStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export enum NotificationCategory {
  ORDER_UPDATES = 'ORDER_UPDATES',
  LOW_STOCK = 'LOW_STOCK',
  BILLING = 'BILLING',
  MARKETING = 'MARKETING',
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export enum ApprovalDecision {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ─── Ratings ──────────────────────────────────────────────────────────────────

export enum ModerationStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ─── Delivery (Phase 2) ───────────────────────────────────────────────────────

export enum VehicleType {
  BIKE = 'BIKE',
  SCOOTER = 'SCOOTER',
  BICYCLE = 'BICYCLE',
  ON_FOOT = 'ON_FOOT',
}

export enum DeliveryPartnerStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

// ─── Merchandising (v3) ───────────────────────────────────────────────────────

export enum DiscountType {
  PERCENT = 'PERCENT',
  FLAT_AMOUNT = 'FLAT_AMOUNT',
}

export enum SaleInitiatedByRole {
  STORE_OWNER = 'STORE_OWNER',
  ADMIN = 'ADMIN',
}

export enum CarouselPlacement {
  APP_HOME_TOP = 'APP_HOME_TOP',
  APP_HOME_MID = 'APP_HOME_MID',
  WEB_HOME_HERO = 'WEB_HOME_HERO',
  STORE_LISTING_TOP = 'STORE_LISTING_TOP',
  CATEGORY_PAGE_TOP = 'CATEGORY_PAGE_TOP',
}

export enum CarouselPlatform {
  APP = 'APP',
  WEB = 'WEB',
  BOTH = 'BOTH',
}

export enum CarouselSlideLinkType {
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  STORE = 'STORE',
  SALE = 'SALE',
  EXTERNAL_URL = 'EXTERNAL_URL',
  NONE = 'NONE',
}

// ─── Domain Event Keys ────────────────────────────────────────────────────────
// Used by the internal EventBus — keeps event names consistent across emitters
// and listeners. Structured for future Kafka topic mapping.

export const DomainEvents = {
  // Auth
  AUTH_OTP_REQUESTED: 'auth.otp_requested',
  AUTH_LOGIN_SUCCESS: 'auth.login_success',

  // Store
  STORE_SUBMITTED: 'store.submitted',
  STORE_WENT_LIVE: 'store.went_live',
  STORE_SUSPENDED: 'store.suspended',

  // Catalog
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',

  // Inventory
  INVENTORY_UPDATED: 'inventory.updated',
  INVENTORY_LOW_STOCK: 'inventory.low_stock',
  PRODUCT_OUT_OF_STOCK: 'product.out_of_stock',

  // Orders
  ORDER_PLACED: 'order.placed',
  ORDER_ACCEPTED: 'order.accepted',
  ORDER_REJECTED: 'order.rejected',
  ORDER_READY: 'order.ready',
  ORDER_OUT_FOR_DELIVERY: 'order.out_for_delivery',
  ORDER_COMPLETED: 'order.completed',
  ORDER_CANCELLED: 'order.cancelled',

  // Payments
  PAYMENT_SUCCESS: 'payment.success',
  PAYMENT_FAILED: 'payment.failed',
  REFUND_INITIATED: 'refund.initiated',
  REFUND_COMPLETED: 'refund.completed',

  // Ratings
  REVIEW_SUBMITTED: 'review.submitted',
  REVIEW_FLAGGED: 'review.flagged',

  // Merchandising
  SALE_ACTIVATED: 'sale.activated',
  SALE_EXPIRED: 'sale.expired',
} as const;

export type DomainEventKey = (typeof DomainEvents)[keyof typeof DomainEvents];
