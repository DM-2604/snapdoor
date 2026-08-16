// Implements v3 §G — In-memory OTP rate limiter (local dev / no-Redis fallback)
//
// Uses a single-process Map with TTL expiry. Suitable for local development only.
//
// ⚠️  WARNING (also logged at startup): This implementation:
//   - Does NOT survive process restarts
//   - Does NOT work correctly across multiple API instances / replicas
//   - Should NEVER be used in production
//
// Set REDIS_ENABLED=true to switch to RedisOtpRateLimiterService.
// Swap point: identity.module.ts → OTP_RATE_LIMITER provider.

import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IOtpRateLimiter } from './otp-rate-limiter.interface';

const RATE_LIMIT_WINDOW_MS = 600_000; // 10 minutes
const MAX_OTP_REQUESTS = 5;

interface RateLimitEntry {
  count: number;
  expiresAt: number;
}

@Injectable()
export class InMemoryOtpRateLimiterService implements IOtpRateLimiter, OnModuleInit {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly logger = new Logger(InMemoryOtpRateLimiterService.name);

  onModuleInit(): void {
    this.logger.warn(
      '[OtpRateLimiter] WARNING: Using in-memory rate limiter — does NOT survive restarts ' +
        'or work across multiple instances. Set REDIS_ENABLED=true for production.',
    );
  }

  async checkAndRecord(phone: string): Promise<void> {
    const now = Date.now();
    const entry = this.store.get(phone);

    if (entry) {
      if (now < entry.expiresAt) {
        // Window still active
        if (entry.count >= MAX_OTP_REQUESTS) {
          throw new HttpException(
            'Too many OTP requests. Try again after 10 minutes.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        entry.count += 1;
        return;
      }
      // Window expired — reset
      this.store.delete(phone);
    }

    // First request in this window
    this.store.set(phone, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
  }
}
