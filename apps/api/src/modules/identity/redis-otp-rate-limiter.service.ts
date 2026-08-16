// Implements v3 §G — Redis-backed OTP rate limiter (production implementation)
//
// Uses ioredis to track request counts per phone within a sliding 10-minute window.
// Activate via REDIS_ENABLED=true in the environment — see identity.module.ts.

import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { IOtpRateLimiter } from './otp-rate-limiter.interface';

const RATE_LIMIT_WINDOW_SEC = 600; // 10 minutes
const MAX_OTP_REQUESTS = 5;
const OTP_RATE_LIMIT_KEY = (phone: string) => `otp:rate:${phone}`;

@Injectable()
export class RedisOtpRateLimiterService implements IOtpRateLimiter {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisOtpRateLimiterService.name);

  constructor(private readonly config: ConfigService) {
    this.redis = new Redis(config.get<string>('redis.url')!);
    this.logger.log('Using Redis OTP rate limiter');
  }

  async checkAndRecord(phone: string): Promise<void> {
    const key = OTP_RATE_LIMIT_KEY(phone);

    const current = await this.redis.get(key);
    if (current && parseInt(current, 10) >= MAX_OTP_REQUESTS) {
      throw new HttpException(
        'Too many OTP requests. Try again after 10 minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, RATE_LIMIT_WINDOW_SEC);
    }
  }
}
