import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

/**
 * NotificationModule — bounded context
 * FCM push + SMS, templated, domain-event-driven — all sequences
 * Sequence diagrams: 9.1-9.10 (receives events from all modules)
 */
@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
