// Implements v3 §G — OTP rate limiter abstraction
//
// Two implementations:
//   - RedisOtpRateLimiterService   (REDIS_ENABLED=true)  — production
//   - InMemoryOtpRateLimiterService (default)             — local dev, no Redis needed
//
// Selected in identity.module.ts via the REDIS_ENABLED env flag.

export const OTP_RATE_LIMITER = Symbol('OTP_RATE_LIMITER');

export interface IOtpRateLimiter {
  /**
   * Record an OTP request for the given phone number.
   * Throws HttpException(429) if the rate limit is exceeded.
   */
  checkAndRecord(phone: string): Promise<void>;
}
