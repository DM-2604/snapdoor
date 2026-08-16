"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvents = exports.CarouselSlideLinkType = exports.CarouselPlatform = exports.CarouselPlacement = exports.SaleInitiatedByRole = exports.DiscountType = exports.DeliveryPartnerStatus = exports.VehicleType = exports.ModerationStatus = exports.ApprovalDecision = exports.NotificationCategory = exports.NotificationStatus = exports.NotificationChannel = exports.PayoutStatus = exports.PaymentGatewayMethod = exports.PaymentStatus = exports.RefundStatus = exports.PaymentMethod = exports.OrderStatus = exports.FulfillmentType = exports.CartStatus = exports.InventoryAdjustmentReason = exports.OnboardingSource = exports.StoreStatus = exports.InvoiceStatus = exports.BillingFrequency = exports.PlatformFeePlanType = exports.CityStatus = exports.PayoutVerificationStatus = exports.PayoutAccountType = exports.PayoutAccountOwnerType = exports.DocumentVerificationStatus = exports.DocType = exports.DocumentOwnerType = exports.DevicePlatform = exports.OtpPurpose = exports.AdminRole = exports.KycStatus = exports.AuthProvider = exports.UserRole = void 0;
// ─── Identity ─────────────────────────────────────────────────────────────────
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "CUSTOMER";
    UserRole["STORE_OWNER"] = "STORE_OWNER";
    UserRole["DELIVERY_PARTNER"] = "DELIVERY_PARTNER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var AuthProvider;
(function (AuthProvider) {
    AuthProvider["PHONE_OTP"] = "PHONE_OTP";
    AuthProvider["GOOGLE"] = "GOOGLE";
})(AuthProvider || (exports.AuthProvider = AuthProvider = {}));
var KycStatus;
(function (KycStatus) {
    KycStatus["NOT_STARTED"] = "NOT_STARTED";
    KycStatus["PENDING"] = "PENDING";
    KycStatus["VERIFIED"] = "VERIFIED";
    KycStatus["REJECTED"] = "REJECTED";
})(KycStatus || (exports.KycStatus = KycStatus = {}));
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    AdminRole["OPS"] = "OPS";
    AdminRole["SUPPORT"] = "SUPPORT";
    AdminRole["FINANCE"] = "FINANCE";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
var OtpPurpose;
(function (OtpPurpose) {
    OtpPurpose["LOGIN"] = "LOGIN";
    OtpPurpose["STORE_OWNER_ONBOARDING"] = "STORE_OWNER_ONBOARDING";
    OtpPurpose["PAYOUT_VERIFICATION"] = "PAYOUT_VERIFICATION";
})(OtpPurpose || (exports.OtpPurpose = OtpPurpose = {}));
var DevicePlatform;
(function (DevicePlatform) {
    DevicePlatform["IOS"] = "IOS";
    DevicePlatform["ANDROID"] = "ANDROID";
    DevicePlatform["WEB"] = "WEB";
})(DevicePlatform || (exports.DevicePlatform = DevicePlatform = {}));
var DocumentOwnerType;
(function (DocumentOwnerType) {
    DocumentOwnerType["STORE_OWNER"] = "STORE_OWNER";
    DocumentOwnerType["STORE"] = "STORE";
    DocumentOwnerType["DELIVERY_PARTNER"] = "DELIVERY_PARTNER";
    DocumentOwnerType["ADMIN"] = "ADMIN";
})(DocumentOwnerType || (exports.DocumentOwnerType = DocumentOwnerType = {}));
var DocType;
(function (DocType) {
    DocType["PAN"] = "PAN";
    DocType["GST_CERTIFICATE"] = "GST_CERTIFICATE";
    DocType["SHOP_LICENSE"] = "SHOP_LICENSE";
    DocType["AADHAAR"] = "AADHAAR";
    DocType["BANK_PROOF"] = "BANK_PROOF";
    DocType["VEHICLE_RC"] = "VEHICLE_RC";
    DocType["DRIVING_LICENSE"] = "DRIVING_LICENSE";
    DocType["PROFILE_PHOTO"] = "PROFILE_PHOTO";
    DocType["OTHER"] = "OTHER";
})(DocType || (exports.DocType = DocType = {}));
var DocumentVerificationStatus;
(function (DocumentVerificationStatus) {
    DocumentVerificationStatus["PENDING"] = "PENDING";
    DocumentVerificationStatus["VERIFIED"] = "VERIFIED";
    DocumentVerificationStatus["REJECTED"] = "REJECTED";
})(DocumentVerificationStatus || (exports.DocumentVerificationStatus = DocumentVerificationStatus = {}));
var PayoutAccountOwnerType;
(function (PayoutAccountOwnerType) {
    PayoutAccountOwnerType["STORE"] = "STORE";
    PayoutAccountOwnerType["DELIVERY_PARTNER"] = "DELIVERY_PARTNER";
})(PayoutAccountOwnerType || (exports.PayoutAccountOwnerType = PayoutAccountOwnerType = {}));
var PayoutAccountType;
(function (PayoutAccountType) {
    PayoutAccountType["BANK"] = "BANK";
    PayoutAccountType["UPI"] = "UPI";
})(PayoutAccountType || (exports.PayoutAccountType = PayoutAccountType = {}));
var PayoutVerificationStatus;
(function (PayoutVerificationStatus) {
    PayoutVerificationStatus["PENDING"] = "PENDING";
    PayoutVerificationStatus["VERIFIED"] = "VERIFIED";
    PayoutVerificationStatus["FAILED"] = "FAILED";
})(PayoutVerificationStatus || (exports.PayoutVerificationStatus = PayoutVerificationStatus = {}));
// ─── Geography ────────────────────────────────────────────────────────────────
var CityStatus;
(function (CityStatus) {
    CityStatus["PLANNED"] = "PLANNED";
    CityStatus["PILOT"] = "PILOT";
    CityStatus["ACTIVE"] = "ACTIVE";
    CityStatus["PAUSED"] = "PAUSED";
    CityStatus["INACTIVE"] = "INACTIVE";
})(CityStatus || (exports.CityStatus = CityStatus = {}));
// ─── Platform Config ──────────────────────────────────────────────────────────
var PlatformFeePlanType;
(function (PlatformFeePlanType) {
    PlatformFeePlanType["FLAT_MONTHLY"] = "FLAT_MONTHLY";
    PlatformFeePlanType["COMMISSION_BASED"] = "COMMISSION_BASED";
    PlatformFeePlanType["HYBRID"] = "HYBRID";
})(PlatformFeePlanType || (exports.PlatformFeePlanType = PlatformFeePlanType = {}));
var BillingFrequency;
(function (BillingFrequency) {
    BillingFrequency["MONTHLY"] = "MONTHLY";
    BillingFrequency["QUARTERLY"] = "QUARTERLY";
})(BillingFrequency || (exports.BillingFrequency = BillingFrequency = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["ISSUED"] = "ISSUED";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["OVERDUE"] = "OVERDUE";
    InvoiceStatus["WAIVED"] = "WAIVED";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
// ─── Store & Catalog ──────────────────────────────────────────────────────────
var StoreStatus;
(function (StoreStatus) {
    StoreStatus["PENDING"] = "PENDING";
    StoreStatus["LIVE"] = "LIVE";
    StoreStatus["SUSPENDED"] = "SUSPENDED";
    StoreStatus["REJECTED"] = "REJECTED";
})(StoreStatus || (exports.StoreStatus = StoreStatus = {}));
var OnboardingSource;
(function (OnboardingSource) {
    OnboardingSource["SELF_SERVE"] = "SELF_SERVE";
    OnboardingSource["ASSISTED_FIELD_AGENT"] = "ASSISTED_FIELD_AGENT";
})(OnboardingSource || (exports.OnboardingSource = OnboardingSource = {}));
// ─── Inventory ────────────────────────────────────────────────────────────────
var InventoryAdjustmentReason;
(function (InventoryAdjustmentReason) {
    InventoryAdjustmentReason["SALE"] = "SALE";
    InventoryAdjustmentReason["RESTOCK"] = "RESTOCK";
    InventoryAdjustmentReason["MANUAL"] = "MANUAL";
    InventoryAdjustmentReason["CORRECTION"] = "CORRECTION";
    InventoryAdjustmentReason["ORDER_CANCELLED_RELEASE"] = "ORDER_CANCELLED_RELEASE";
})(InventoryAdjustmentReason || (exports.InventoryAdjustmentReason = InventoryAdjustmentReason = {}));
// ─── Orders ───────────────────────────────────────────────────────────────────
var CartStatus;
(function (CartStatus) {
    CartStatus["ACTIVE"] = "ACTIVE";
    CartStatus["CONVERTED"] = "CONVERTED";
    CartStatus["ABANDONED"] = "ABANDONED";
})(CartStatus || (exports.CartStatus = CartStatus = {}));
var FulfillmentType;
(function (FulfillmentType) {
    FulfillmentType["TAKEAWAY"] = "TAKEAWAY";
    FulfillmentType["STORE_DELIVERY"] = "STORE_DELIVERY";
    FulfillmentType["PLATFORM_DELIVERY"] = "PLATFORM_DELIVERY";
})(FulfillmentType || (exports.FulfillmentType = FulfillmentType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PLACED"] = "PLACED";
    OrderStatus["ACCEPTED"] = "ACCEPTED";
    OrderStatus["REJECTED"] = "REJECTED";
    OrderStatus["PREPARING"] = "PREPARING";
    OrderStatus["READY_FOR_PICKUP"] = "READY_FOR_PICKUP";
    OrderStatus["OUT_FOR_DELIVERY"] = "OUT_FOR_DELIVERY";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["UPI"] = "UPI";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["COD"] = "COD";
    PaymentMethod["PAY_AT_PICKUP"] = "PAY_AT_PICKUP";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var RefundStatus;
(function (RefundStatus) {
    RefundStatus["INITIATED"] = "INITIATED";
    RefundStatus["PROCESSING"] = "PROCESSING";
    RefundStatus["COMPLETED"] = "COMPLETED";
    RefundStatus["FAILED"] = "FAILED";
})(RefundStatus || (exports.RefundStatus = RefundStatus = {}));
// ─── Payments ─────────────────────────────────────────────────────────────────
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["INITIATED"] = "INITIATED";
    PaymentStatus["SUCCESS"] = "SUCCESS";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentGatewayMethod;
(function (PaymentGatewayMethod) {
    PaymentGatewayMethod["UPI"] = "UPI";
    PaymentGatewayMethod["CARD"] = "CARD";
    PaymentGatewayMethod["COD"] = "COD";
})(PaymentGatewayMethod || (exports.PaymentGatewayMethod = PaymentGatewayMethod = {}));
var PayoutStatus;
(function (PayoutStatus) {
    PayoutStatus["PENDING"] = "PENDING";
    PayoutStatus["INITIATED"] = "INITIATED";
    PayoutStatus["COMPLETED"] = "COMPLETED";
    PayoutStatus["FAILED"] = "FAILED";
})(PayoutStatus || (exports.PayoutStatus = PayoutStatus = {}));
// ─── Notifications ────────────────────────────────────────────────────────────
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["PUSH"] = "PUSH";
    NotificationChannel["SMS"] = "SMS";
    NotificationChannel["EMAIL"] = "EMAIL";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["SENT"] = "SENT";
    NotificationStatus["FAILED"] = "FAILED";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
var NotificationCategory;
(function (NotificationCategory) {
    NotificationCategory["ORDER_UPDATES"] = "ORDER_UPDATES";
    NotificationCategory["LOW_STOCK"] = "LOW_STOCK";
    NotificationCategory["BILLING"] = "BILLING";
    NotificationCategory["MARKETING"] = "MARKETING";
})(NotificationCategory || (exports.NotificationCategory = NotificationCategory = {}));
// ─── Admin ────────────────────────────────────────────────────────────────────
var ApprovalDecision;
(function (ApprovalDecision) {
    ApprovalDecision["PENDING"] = "PENDING";
    ApprovalDecision["APPROVED"] = "APPROVED";
    ApprovalDecision["REJECTED"] = "REJECTED";
})(ApprovalDecision || (exports.ApprovalDecision = ApprovalDecision = {}));
// ─── Ratings ──────────────────────────────────────────────────────────────────
var ModerationStatus;
(function (ModerationStatus) {
    ModerationStatus["NONE"] = "NONE";
    ModerationStatus["PENDING"] = "PENDING";
    ModerationStatus["APPROVED"] = "APPROVED";
    ModerationStatus["REJECTED"] = "REJECTED";
})(ModerationStatus || (exports.ModerationStatus = ModerationStatus = {}));
// ─── Delivery (Phase 2) ───────────────────────────────────────────────────────
var VehicleType;
(function (VehicleType) {
    VehicleType["BIKE"] = "BIKE";
    VehicleType["SCOOTER"] = "SCOOTER";
    VehicleType["BICYCLE"] = "BICYCLE";
    VehicleType["ON_FOOT"] = "ON_FOOT";
})(VehicleType || (exports.VehicleType = VehicleType = {}));
var DeliveryPartnerStatus;
(function (DeliveryPartnerStatus) {
    DeliveryPartnerStatus["PENDING"] = "PENDING";
    DeliveryPartnerStatus["ACTIVE"] = "ACTIVE";
    DeliveryPartnerStatus["INACTIVE"] = "INACTIVE";
    DeliveryPartnerStatus["SUSPENDED"] = "SUSPENDED";
})(DeliveryPartnerStatus || (exports.DeliveryPartnerStatus = DeliveryPartnerStatus = {}));
// ─── Merchandising (v3) ───────────────────────────────────────────────────────
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENT"] = "PERCENT";
    DiscountType["FLAT_AMOUNT"] = "FLAT_AMOUNT";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
var SaleInitiatedByRole;
(function (SaleInitiatedByRole) {
    SaleInitiatedByRole["STORE_OWNER"] = "STORE_OWNER";
    SaleInitiatedByRole["ADMIN"] = "ADMIN";
})(SaleInitiatedByRole || (exports.SaleInitiatedByRole = SaleInitiatedByRole = {}));
var CarouselPlacement;
(function (CarouselPlacement) {
    CarouselPlacement["APP_HOME_TOP"] = "APP_HOME_TOP";
    CarouselPlacement["APP_HOME_MID"] = "APP_HOME_MID";
    CarouselPlacement["WEB_HOME_HERO"] = "WEB_HOME_HERO";
    CarouselPlacement["STORE_LISTING_TOP"] = "STORE_LISTING_TOP";
    CarouselPlacement["CATEGORY_PAGE_TOP"] = "CATEGORY_PAGE_TOP";
})(CarouselPlacement || (exports.CarouselPlacement = CarouselPlacement = {}));
var CarouselPlatform;
(function (CarouselPlatform) {
    CarouselPlatform["APP"] = "APP";
    CarouselPlatform["WEB"] = "WEB";
    CarouselPlatform["BOTH"] = "BOTH";
})(CarouselPlatform || (exports.CarouselPlatform = CarouselPlatform = {}));
var CarouselSlideLinkType;
(function (CarouselSlideLinkType) {
    CarouselSlideLinkType["PRODUCT"] = "PRODUCT";
    CarouselSlideLinkType["CATEGORY"] = "CATEGORY";
    CarouselSlideLinkType["STORE"] = "STORE";
    CarouselSlideLinkType["SALE"] = "SALE";
    CarouselSlideLinkType["EXTERNAL_URL"] = "EXTERNAL_URL";
    CarouselSlideLinkType["NONE"] = "NONE";
})(CarouselSlideLinkType || (exports.CarouselSlideLinkType = CarouselSlideLinkType = {}));
// ─── Domain Event Keys ────────────────────────────────────────────────────────
// Used by the internal EventBus — keeps event names consistent across emitters
// and listeners. Structured for future Kafka topic mapping.
exports.DomainEvents = {
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
};
//# sourceMappingURL=index.js.map