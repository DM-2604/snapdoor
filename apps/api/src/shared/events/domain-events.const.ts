// Implements v3 §0.0 — domain event string constants
// Add new constants here as modules are built — don't pre-populate speculatively.

export const DomainEvents = {
  // Identity
  USER_CREATED: 'user.created',
  USER_BLOCKED: 'user.blocked',

  // Store lifecycle
  STORE_WENT_LIVE: 'store.went_live',
  STORE_SUSPENDED: 'store.suspended',

  // Orders
  ORDER_PLACED: 'order.placed',
  ORDER_ACCEPTED: 'order.accepted',
  ORDER_REJECTED: 'order.rejected',
  ORDER_PREPARING: 'order.preparing',
  ORDER_READY: 'order.ready',
  ORDER_DISPATCHED: 'order.dispatched',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_COMPLETED: 'order.completed',
  ORDER_POS_COMPLETED: 'order.pos_completed',
  ORDER_REVIEWED: 'order.reviewed',

  // Inventory
  INVENTORY_UPDATED: 'inventory.updated',
  INVENTORY_LOW_STOCK: 'inventory.low_stock',

  // Merchandising
  SALE_ACTIVATED: 'sale.activated',
  SALE_DEACTIVATED: 'sale.deactivated',

  // Theming
  THEME_ACTIVATED: 'theme.activated',
} as const;

export type DomainEventKey = (typeof DomainEvents)[keyof typeof DomainEvents];
