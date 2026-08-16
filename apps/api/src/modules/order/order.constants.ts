export const CANCEL_WINDOW_SECONDS = {
  TAKEAWAY: 120,
  PAY_AT_PICKUP: 120,
  STORE_DELIVERY: 30,
  PLATFORM_DELIVERY: 30,
} as const;

/** PLACED orders with no store action auto-cancel after this many minutes */
export const STALE_ORDER_TIMEOUT_MINUTES = 15;

// PICKUP_TIMEOUT_MINUTES = 120; // PAY_AT_PICKUP no-show timeout — Phase 2
