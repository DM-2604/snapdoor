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
export declare enum UserRole {
    CUSTOMER = "CUSTOMER",
    STORE_OWNER = "STORE_OWNER",
    DELIVERY_PARTNER = "DELIVERY_PARTNER",
    ADMIN = "ADMIN"
}
export declare enum AuthProvider {
    PHONE_OTP = "PHONE_OTP",
    GOOGLE = "GOOGLE"
}
export declare enum KycStatus {
    NOT_STARTED = "NOT_STARTED",
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}
export declare enum AdminRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    OPS = "OPS",
    SUPPORT = "SUPPORT",
    FINANCE = "FINANCE"
}
export declare enum OtpPurpose {
    LOGIN = "LOGIN",
    STORE_OWNER_ONBOARDING = "STORE_OWNER_ONBOARDING",
    PAYOUT_VERIFICATION = "PAYOUT_VERIFICATION"
}
export declare enum DevicePlatform {
    IOS = "IOS",
    ANDROID = "ANDROID",
    WEB = "WEB"
}
export declare enum DocumentOwnerType {
    STORE_OWNER = "STORE_OWNER",
    STORE = "STORE",
    DELIVERY_PARTNER = "DELIVERY_PARTNER",
    ADMIN = "ADMIN"
}
export declare enum DocType {
    PAN = "PAN",
    GST_CERTIFICATE = "GST_CERTIFICATE",
    SHOP_LICENSE = "SHOP_LICENSE",
    AADHAAR = "AADHAAR",
    BANK_PROOF = "BANK_PROOF",
    VEHICLE_RC = "VEHICLE_RC",
    DRIVING_LICENSE = "DRIVING_LICENSE",
    PROFILE_PHOTO = "PROFILE_PHOTO",
    OTHER = "OTHER"
}
export declare enum DocumentVerificationStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}
export declare enum PayoutAccountOwnerType {
    STORE = "STORE",
    DELIVERY_PARTNER = "DELIVERY_PARTNER"
}
export declare enum PayoutAccountType {
    BANK = "BANK",
    UPI = "UPI"
}
export declare enum PayoutVerificationStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    FAILED = "FAILED"
}
export declare enum CityStatus {
    PLANNED = "PLANNED",
    PILOT = "PILOT",
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    INACTIVE = "INACTIVE"
}
export declare enum PlatformFeePlanType {
    FLAT_MONTHLY = "FLAT_MONTHLY",
    COMMISSION_BASED = "COMMISSION_BASED",
    HYBRID = "HYBRID"
}
export declare enum BillingFrequency {
    MONTHLY = "MONTHLY",
    QUARTERLY = "QUARTERLY"
}
export declare enum InvoiceStatus {
    DRAFT = "DRAFT",
    ISSUED = "ISSUED",
    PAID = "PAID",
    OVERDUE = "OVERDUE",
    WAIVED = "WAIVED"
}
export declare enum StoreStatus {
    PENDING = "PENDING",
    LIVE = "LIVE",
    SUSPENDED = "SUSPENDED",
    REJECTED = "REJECTED"
}
export declare enum OnboardingSource {
    SELF_SERVE = "SELF_SERVE",
    ASSISTED_FIELD_AGENT = "ASSISTED_FIELD_AGENT"
}
export declare enum InventoryAdjustmentReason {
    SALE = "SALE",
    RESTOCK = "RESTOCK",
    MANUAL = "MANUAL",
    CORRECTION = "CORRECTION",
    ORDER_CANCELLED_RELEASE = "ORDER_CANCELLED_RELEASE"
}
export declare enum CartStatus {
    ACTIVE = "ACTIVE",
    CONVERTED = "CONVERTED",
    ABANDONED = "ABANDONED"
}
export declare enum FulfillmentType {
    TAKEAWAY = "TAKEAWAY",
    STORE_DELIVERY = "STORE_DELIVERY",
    PLATFORM_DELIVERY = "PLATFORM_DELIVERY"
}
export declare enum OrderStatus {
    PLACED = "PLACED",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    PREPARING = "PREPARING",
    READY_FOR_PICKUP = "READY_FOR_PICKUP",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentMethod {
    UPI = "UPI",
    CARD = "CARD",
    COD = "COD",
    PAY_AT_PICKUP = "PAY_AT_PICKUP"
}
export declare enum RefundStatus {
    INITIATED = "INITIATED",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare enum PaymentStatus {
    INITIATED = "INITIATED",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare enum PaymentGatewayMethod {
    UPI = "UPI",
    CARD = "CARD",
    COD = "COD"
}
export declare enum PayoutStatus {
    PENDING = "PENDING",
    INITIATED = "INITIATED",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare enum NotificationChannel {
    PUSH = "PUSH",
    SMS = "SMS",
    EMAIL = "EMAIL"
}
export declare enum NotificationStatus {
    SENT = "SENT",
    FAILED = "FAILED"
}
export declare enum NotificationCategory {
    ORDER_UPDATES = "ORDER_UPDATES",
    LOW_STOCK = "LOW_STOCK",
    BILLING = "BILLING",
    MARKETING = "MARKETING"
}
export declare enum ApprovalDecision {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare enum ModerationStatus {
    NONE = "NONE",
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare enum VehicleType {
    BIKE = "BIKE",
    SCOOTER = "SCOOTER",
    BICYCLE = "BICYCLE",
    ON_FOOT = "ON_FOOT"
}
export declare enum DeliveryPartnerStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}
export declare enum DiscountType {
    PERCENT = "PERCENT",
    FLAT_AMOUNT = "FLAT_AMOUNT"
}
export declare enum SaleInitiatedByRole {
    STORE_OWNER = "STORE_OWNER",
    ADMIN = "ADMIN"
}
export declare enum CarouselPlacement {
    APP_HOME_TOP = "APP_HOME_TOP",
    APP_HOME_MID = "APP_HOME_MID",
    WEB_HOME_HERO = "WEB_HOME_HERO",
    STORE_LISTING_TOP = "STORE_LISTING_TOP",
    CATEGORY_PAGE_TOP = "CATEGORY_PAGE_TOP"
}
export declare enum CarouselPlatform {
    APP = "APP",
    WEB = "WEB",
    BOTH = "BOTH"
}
export declare enum CarouselSlideLinkType {
    PRODUCT = "PRODUCT",
    CATEGORY = "CATEGORY",
    STORE = "STORE",
    SALE = "SALE",
    EXTERNAL_URL = "EXTERNAL_URL",
    NONE = "NONE"
}
export declare const DomainEvents: {
    readonly AUTH_OTP_REQUESTED: "auth.otp_requested";
    readonly AUTH_LOGIN_SUCCESS: "auth.login_success";
    readonly STORE_SUBMITTED: "store.submitted";
    readonly STORE_WENT_LIVE: "store.went_live";
    readonly STORE_SUSPENDED: "store.suspended";
    readonly PRODUCT_CREATED: "product.created";
    readonly PRODUCT_UPDATED: "product.updated";
    readonly INVENTORY_UPDATED: "inventory.updated";
    readonly INVENTORY_LOW_STOCK: "inventory.low_stock";
    readonly PRODUCT_OUT_OF_STOCK: "product.out_of_stock";
    readonly ORDER_PLACED: "order.placed";
    readonly ORDER_ACCEPTED: "order.accepted";
    readonly ORDER_REJECTED: "order.rejected";
    readonly ORDER_READY: "order.ready";
    readonly ORDER_OUT_FOR_DELIVERY: "order.out_for_delivery";
    readonly ORDER_COMPLETED: "order.completed";
    readonly ORDER_CANCELLED: "order.cancelled";
    readonly PAYMENT_SUCCESS: "payment.success";
    readonly PAYMENT_FAILED: "payment.failed";
    readonly REFUND_INITIATED: "refund.initiated";
    readonly REFUND_COMPLETED: "refund.completed";
    readonly REVIEW_SUBMITTED: "review.submitted";
    readonly REVIEW_FLAGGED: "review.flagged";
    readonly SALE_ACTIVATED: "sale.activated";
    readonly SALE_EXPIRED: "sale.expired";
};
export type DomainEventKey = (typeof DomainEvents)[keyof typeof DomainEvents];
//# sourceMappingURL=index.d.ts.map