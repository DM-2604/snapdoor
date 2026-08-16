# Identity Module

## Purpose
Owns all authentication concerns: OTP generation/verification, JWT issuance, session management, and token refresh.

## Prisma Models Owned
- `User` (read/upsert — the authoritative upsert on first OTP verify)
- `OtpRequest`
- `Session`
- `Device`

## Endpoints Exposed
```
POST /auth/otp/request    — generate + send OTP (rate-limited)
POST /auth/otp/verify     — verify OTP, return access + refresh tokens
POST /auth/refresh        — exchange refresh token for new token pair
POST /auth/logout         — revoke session
```
All endpoints are public (`@Public()` decorator bypasses `JwtAuthGuard`).

## OTP Rate Limiter

Two implementations, selected via `REDIS_ENABLED` env flag:

| `REDIS_ENABLED` | Implementation | Notes |
|---|---|---|
| unset / `false` | `InMemoryOtpRateLimiterService` | Local dev only — does NOT survive restarts or scale across instances |
| `true` | `RedisOtpRateLimiterService` | Production — requires `REDIS_URL` env var |

**Swap point**: `identity.module.ts` → `OTP_RATE_LIMITER` provider registration (line ~42).

> [!WARNING]
> `InMemoryOtpRateLimiterService` logs a startup warning and must never be deployed to production.
> Set `REDIS_ENABLED=true` and ensure `REDIS_URL` is configured before going live.

## Deferred / Stubbed
- Google OAuth (`authProvider: GOOGLE`) — schema supports it, no controller endpoint yet.
- Swap point: `identity.controller.ts` — add `GET /auth/google` + `GET /auth/google/callback`.
