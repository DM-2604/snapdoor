// Implements v3 §5b — Store Notification (synchronous in-process implementation)
//
// Writes a NotificationLog row using the 'store.went_live' template (or relevant event key).
// This is the dev/Phase 1 implementation — no Redis/BullMQ required.
//
// TODO: Replace with BullMQ-backed StoreNotificationQueueService when Redis is wired.
//       Swap point: admin-ops.module.ts → STORE_NOTIFICATION_SERVICE provider.

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { IStoreNotificationService } from './store-notification.interface';

@Injectable()
export class StoreNotificationSyncService implements IStoreNotificationService {
  private readonly logger = new Logger(StoreNotificationSyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  async notifyStoreApprovalDecision(
    storeId: string,
    decision: 'APPROVED' | 'REJECTED' | 'REQUEST_CHANGES',
    reason?: string,
  ): Promise<void> {
    // Resolve the event key → notification template
    const eventKey =
      decision === 'APPROVED' ? 'store.went_live' : 'order.rejected'; // reuse closest template

    const store = await this.prisma.store.findFirst({
      where: { id: storeId },
      select: { ownerUserId: true, name: true },
    });

    if (!store) {
      this.logger.warn(`[StoreNotification] Store ${storeId} not found — skipping notification`);
      return;
    }

    const template = await this.prisma.notificationTemplate.findFirst({
      where: { eventKey, channel: 'PUSH', language: 'en' },
    });

    if (!template) {
      this.logger.warn(
        `[StoreNotification] No template for eventKey=${eventKey} — notification not logged`,
      );
      return;
    }

    await this.prisma.notificationLog.create({
      data: {
        userId: store.ownerUserId,
        templateId: template.id,
        channel: 'PUSH',
        status: 'SENT',
        relatedEntityType: 'Store',
        relatedEntityId: storeId,
      },
    });

    this.logger.log(
      `[StoreNotification] Logged ${decision} notification for store ${storeId} (owner ${store.ownerUserId})`,
    );
  }
}
