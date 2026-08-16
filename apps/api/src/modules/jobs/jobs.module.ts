import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { IdempotencyCleanupJob } from './idempotency-cleanup.job';
import { OrderTimeoutJob } from './order-timeout.job';

/**
 * JobsModule — registers background job providers.
 *
 * Phase 1: Jobs are injectable but @Cron decorators are commented out.
 *          Do NOT add ScheduleModule.forRoot() here until Phase 2.
 *
 * Phase 2: Add `ScheduleModule.forRoot()` to this module's imports to enable
 *          scheduled execution after un-commenting the @Cron decorators.
 */
@Module({
  imports: [
    InventoryModule, // OrderTimeoutJob depends on InventoryService
    // ScheduleModule.forRoot(), // ← uncomment in Phase 2
  ],
  providers: [OrderTimeoutJob, IdempotencyCleanupJob],
  exports: [OrderTimeoutJob, IdempotencyCleanupJob],
})
export class JobsModule {}
