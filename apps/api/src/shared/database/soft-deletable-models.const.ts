// Implements v3 §0.1 — soft-delete model registry
// Source of truth: derived by scanning schema.prisma for every model with a
// `deletedAt DateTime? @map("deleted_at")` field.
//
// IMPORTANT: The WITH list below is authoritative.
// Excluded models (no deletedAt column or tax/audit compliance records):
//   OtpRequest, Session, OrderItem, OrderStatusHistory, Payment,
//   InventoryAdjustment, AuditLog, NotificationLog, StoreZoneReassignmentLog,
//   Order, Invoice, SalesInvoice, Settlement
// These must never be soft-deleted or silently filtered by the extension.

export const SOFT_DELETABLE_MODELS = new Set<string>([
  'City',
  'Zone',
  'CommissionRule',
  'PlatformFeePlan',
  'PlatformSetting',
  'StoreBilling',
  'User',
  'StoreOwner',
  'AdminUser',
  'Device',
  'Document',
  'PayoutAccount',
  'Store',
  'StoreOperatingHour',
  'StoreHourException',
  'StoreDeliveryStaff',
  'Category',
  'StoreCategory',
  'Product',
  'ProductVariant',
  'Inventory',
  'Cart',
  'CartItem',
  'OrderCustomerContact',
  'Refund',
  'Review',
  'DeliveryPartner',
  'DeliveryAssignment',
  'NotificationTemplate',
  'NotificationPreference',
  'StoreApprovalQueue',
  'Campaign',
  'Sale',
  'Carousel',
  'CarouselSlide',
  'Theme',
]);
