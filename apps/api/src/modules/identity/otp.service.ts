// Implements v3 §9.1 — OTP generation, hashing, and rate-limiting service
//
// Rate limiting is delegated to an injected IOtpRateLimiter (OTP_RATE_LIMITER token).
// The implementation is selected in identity.module.ts based on REDIS_ENABLED env flag.

import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IOtpRateLimiter, OTP_RATE_LIMITER } from './otp-rate-limiter.interface';

const OTP_EXPIRY_SEC = 300; // 5 minutes
const MAX_VERIFY_ATTEMPTS = 5;

@Injectable()
export class OtpService {
  constructor(
    @Inject(OTP_RATE_LIMITER) private readonly rateLimiter: IOtpRateLimiter,
  ) {}

  /** Generate a 6-digit OTP, hash it, and enforce rate limits. */
  async generateOtp(phone: string): Promise<{ otp: string; otpHash: string; expiresAt: Date }> {
    await this.rateLimiter.checkAndRecord(phone);

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_SEC * 1000);

    return { otp, otpHash, expiresAt };
  }

  /** Verify OTP against its bcrypt hash. Returns true if valid. */
  async verifyOtp(otp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(otp, hash);
  }

  get maxVerifyAttempts() {
    return MAX_VERIFY_ATTEMPTS;
  }

  get otpExpirySec() {
    return OTP_EXPIRY_SEC;
  }
}
