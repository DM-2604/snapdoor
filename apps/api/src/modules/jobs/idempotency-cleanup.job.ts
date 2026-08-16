import { Injectable, Logger } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule'; // ← uncomment in Phase 2 to enable scheduled execution
import { PrismaService } from '../../shared/database/prisma.service';

/**
 * Cleans up expired idempotency keys from the DB.
 *
 * Phase 1: @Cron decorator is commented out — not auto-started.
 * Phase 2: un-comment the @Cron decorator and add ScheduleModule.forRoot() to AppModule.
 */
@Injectable()
export class IdempotencyCleanupJob {
  private readonly logger = new Logger(IdempotencyCleanupJob.name);

  constructor(private readonly prisma: PrismaService) {}

  // @Cron('0 2 * * *') // ← uncomment in Phase 2 to run daily at 2am
  async cleanupExpiredKeys(): Promise<void> {
    const deleted = await this.prisma.idempotencyKey.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    this.logger.log(`Cleaned up ${deleted.count} expired idempotency keys`);
  }
}
