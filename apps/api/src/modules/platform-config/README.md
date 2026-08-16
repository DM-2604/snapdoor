# Platform Config Module

## Purpose
Owns all platform-wide configuration: geography (cities + zones), commission rules, platform fee plans, and key-value settings. Commission resolution logic is in `CommissionResolverService`.

## Prisma Models Owned
- `City`
- `Zone`
- `CommissionRule` (append-only — no update endpoint)
- `PlatformFeePlan`
- `PlatformSetting`

## Endpoints Exposed

```
POST   /admin/geo/cities
GET    /admin/geo/cities
PATCH  /admin/geo/cities/:id
POST   /admin/geo/cities/:cityId/zones
GET    /admin/geo/cities/:cityId/zones
PATCH  /admin/geo/zones/:id
POST   /admin/commission/rules
GET    /admin/commission/rules
POST   /admin/fee-plans
GET    /admin/fee-plans
PATCH  /admin/fee-plans/:id
GET    /admin/settings/:key
PUT    /admin/settings/:key
```

## Zone Centroid vs Boundary

> [!NOTE]
> Zone centroid (`lat`/`lng`) is set via a plain lat/lng form field, persisted through `geo.ts` PostGIS raw SQL helpers.
>
> **Full polygon boundary drawing (map UI) is OUT OF SCOPE for Phase 1** — see `DECISIONS.md §3`.

## Commission Resolution

`CommissionResolverService.resolve()` implements 5-tier precedence:
1. Store-specific
2. Zone-specific
3. Category-specific
4. City default
5. Platform global (seeded Tier 5 fallback at 10%)

`Store.effectiveCommissionPercent` may ONLY be written via `CommissionResolverService.applyEffectiveRateToStore()`. See `FIXME:COMMISSION_GUARD` comments in the codebase.
