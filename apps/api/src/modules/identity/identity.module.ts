// Implements v3 §9.1 — Identity module (OTP auth flow)
//
// OTP rate limiting is DI-swappable via OTP_RATE_LIMITER token:
//   - REDIS_ENABLED=true  → RedisOtpRateLimiterService  (production)
//   - default             → InMemoryOtpRateLimiterService (local dev, no Redis required)
//
// TODO: Replace InMemoryOtpRateLimiterService with RedisOtpRateLimiterService
//       by setting REDIS_ENABLED=true once Redis is wired in production.
//       Swap point: the OTP_RATE_LIMITER provider below.

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { OtpService } from './otp.service';
import { SmsService } from './sms.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ActorContextService } from '../../shared/cls/actor-context.service';
import { OTP_RATE_LIMITER } from './otp-rate-limiter.interface';
import { RedisOtpRateLimiterService } from './redis-otp-rate-limiter.service';
import { InMemoryOtpRateLimiterService } from './in-memory-otp-rate-limiter.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('auth.jwtSecret'),
        signOptions: { expiresIn: config.get<string>('auth.jwtExpiry') },
      }),
    }),
  ],
  controllers: [IdentityController],
  providers: [
    IdentityService,
    OtpService,
    SmsService,
    JwtStrategy,
    ActorContextService,
    // TODO: Replace with RedisOtpRateLimiterService when Redis is wired (REDIS_ENABLED=true):
    //   { provide: OTP_RATE_LIMITER, useClass: RedisOtpRateLimiterService }
    {
      provide: OTP_RATE_LIMITER,
      useClass:
        process.env.REDIS_ENABLED === 'true'
          ? RedisOtpRateLimiterService
          : InMemoryOtpRateLimiterService,
    },
  ],
  exports: [IdentityService, JwtModule],
})
export class IdentityModule {}
