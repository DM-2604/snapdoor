// Implements v3 §2.5 — Monthly billing job processor (stub)
// Full billing logic is implemented when the BillingModule is built out.
// The @Cron trigger is commented out intentionally — enable it when the
// processor has real logic and the billing module is complete.

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { MONTHLY_BILLING_QUEUE } from './queue.constants';

@Processor(MONTHLY_BILLING_QUEUE)
export class MonthlyBillingProcessor extends WorkerHost {
  private readonly logger = new Logger(MonthlyBillingProcessor.name);

  async process(_job: Job): Promise<void> {
    // TODO: Implement monthly billing logic in BillingModule
    // Steps (when built):
    //   1. Find all stores with active StoreBilling records
    //   2. Calculate commission totals from Orders in the period
    //   3. Apply PlatformFeePlan rates
    //   4. Generate Invoice records
    //   5. Trigger payout settlement via PaymentModule
    this.logger.warn('MonthlyBillingProcessor: stub — no logic yet');
  }

  // @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  // async scheduledBillingRun() {
  //   await this.queue.add('run', {}, { attempts: 3, backoff: { type: 'exponential', delay: 60_000 } });
  // }
}
