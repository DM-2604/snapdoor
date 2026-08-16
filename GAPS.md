# GAPS.md — LocalMart Deferred Items & Roadmap

Tracks all items that are intentionally NOT done or deferred to future sprints and must be resolved before a full production launch.

---

## Testing

| Gap | Notes |
|---|---|
| E2E / integration tests | Unit tests (Jest + mocked Prisma) cover 100% of services. Full E2E tests against Neon dev DB deferred. |
| `REDIS_ENABLED=true` path not tested in CI | Requires a Redis service in the pipeline — deferred. |

---

## Infrastructure

| Gap | Notes |
|---|---|
| Real BullMQ wiring for store notifications | `StoreNotificationSyncService` writes a DB row synchronously. Swap point: `admin-ops.module.ts` → `STORE_NOTIFICATION_SERVICE` provider. |
| `InMemoryOtpRateLimiterService` in production | Will not survive restarts or scale across instances. Set `REDIS_ENABLED=true` and configure `REDIS_URL` before launch. Swap point: `identity.module.ts` → `OTP_RATE_LIMITER` provider. |

---

## Admin Features

| Gap | Notes |
|---|---|
| `StoreBilling` admin editing UI | Admin can view a read-only billing snapshot on the store detail page. Editing billing config (fee plan, invoice prefix, etc.) is not wired in UI. |
| `PayoutAccount` verification UI | `DocumentsService` handles KYC & verification. Admin UI for manual bank document verification deferred. |
| Zone polygon boundary drawing (map UI) | Only centroid lat/lng via a form for Phase 1. Full polygon drawing requires a map widget (Google Maps/Mapbox) and vertex editing UI. Schema and PostGIS extension already support it — zero schema changes needed. See `DECISIONS.md §3`. |

---

## Store-Owner Features (Backend vs Frontend)

| Gap | Notes |
|---|---|
| Self-serve store registration deprecated | Removed `POST /store/register` and OtpPurpose-based role-upgrade logic. Store creation is now 100% Admin-initiated (`POST /api/v1/admin/stores`) in `DRAFT` status per `DECISIONS.md §9`. |
| Bulk CSV catalog upload | Store owners currently create products and variants via standard REST CRUD (`POST /api/v1/store/products`). Bulk CSV catalog parser/importer deferred to Phase 3. |
| Multi-store-per-owner context switching | Currently scoped 1:1 between `User(UserRole.STORE_OWNER)` and `Store`. Multi-store management per single merchant account deferred. |
| Store-Owner Web UI (`store-web`) | Backend APIs are 100% complete with Swagger docs and guards. Next.js store merchant dashboard frontend will be built in the dedicated `store-web` frontend sprint. |
| Store-owner-created custom sub-categories | Owners assign products to platform category taxonomy. Custom taxonomy branches deferred. See `DECISIONS.md §6–7`. |

---

## Security / Production Hardening

| Gap | Notes |
|---|---|
| Refresh token stored as plain UUID in Session table | `session.refreshTokenHash` stores the raw UUID for initial development. In production, bcrypt-hash this before storing. |
| SMS OTP delivery | `SmsService` is a stub that logs the OTP to console. Must be replaced with a real SMS gateway (Twilio, MSG91, etc.) before launch. |
| Rate limiting on non-OTP endpoints | Global `ThrottlerModule` (10 req/sec, 100 req/min) is applied. Per-endpoint fine-grained rate limiting to be tuned in staging. |
