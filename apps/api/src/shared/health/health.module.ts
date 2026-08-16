// Implements v3 §0.0 — Health check module (@nestjs/terminus)
// Checks: DB ping (Prisma) + Redis ping (ioredis via BullMQ connection)

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class HealthModule {}
