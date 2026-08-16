// Implements v3 §5b — Store Notification Interface
//
// DI-swappable notification service for store approval decisions.
// Current implementation: StoreNotificationSyncService (writes NotificationLog row).
// Future swap: BullMQ-backed StoreNotificationQueueService when Redis is wired.
// Swap point: admin-ops.module.ts → STORE_NOTIFICATION_SERVICE provider.

export const STORE_NOTIFICATION_SERVICE = Symbol('STORE_NOTIFICATION_SERVICE');

export interface IStoreNotificationService {
  /**
   * Notify the store owner of an approval decision.
   * @param storeId   UUID of the store
   * @param decision  'APPROVED' | 'REJECTED' | 'REQUEST_CHANGES'
   * @param reason    Optional reason (required for rejected/request-changes)
   */
  notifyStoreApprovalDecision(
    storeId: string,
    decision: 'APPROVED' | 'REJECTED' | 'REQUEST_CHANGES',
    reason?: string,
  ): Promise<void>;
}
