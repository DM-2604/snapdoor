// Implements v3 — AdminOps module

import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { AdminDashboardController } from './admin-dashboard.controller';
import { StoreNotificationSyncService } from './store-notification-sync.service';
import { STORE_NOTIFICATION_SERVICE } from './store-notification.interface';
import { PlatformConfigModule } from '../platform-config/platform-config.module';

@Module({
  imports: [PlatformConfigModule],
  controllers: [AuditLogController, AdminDashboardController],
  providers: [
    AuditLogService,
    // TODO: Replace with BullMQ-backed StoreNotificationQueueService when Redis is wired:
    //   { provide: STORE_NOTIFICATION_SERVICE, useClass: StoreNotificationQueueService }
    { provide: STORE_NOTIFICATION_SERVICE, useClass: StoreNotificationSyncService },
  ],
  exports: [AuditLogService, STORE_NOTIFICATION_SERVICE],
})
export class AdminOpsModule {}
