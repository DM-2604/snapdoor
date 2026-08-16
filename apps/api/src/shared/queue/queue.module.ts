// Implements v3 §2.5 — BullMQ queue module
// Uses the existing ioredis connection (no second Redis client).
// Connection details read from ConfigService — never hardcoded.

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { MonthlyBillingProcessor } from './monthly-billing.processor';

import { MONTHLY_BILLING_QUEUE } from './queue.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('redis.url'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: MONTHLY_BILLING_QUEUE,
    }),
  ],
  providers: [MonthlyBillingProcessor],
  exports: [BullModule],
})
export class QueueModule {}
