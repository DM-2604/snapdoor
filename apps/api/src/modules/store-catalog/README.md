# Store Catalog Module

## Purpose
Owns the platform store directory, store approval workflow, and platform category taxonomy.

## Prisma Models Owned
- `Store`
- `StoreApprovalQueue`
- `Category` (platform-wide taxonomy)

> ⚠️ `Document` and `PayoutAccount` are owned by the **Documents module**. Never query them here — always call `DocumentsService`.

## Endpoints Exposed

```
GET    /admin/stores                       ← full directory (filterable by status, city, zone, search)
GET    /admin/stores/:id                   ← full store detail + owner contact + billing snapshot
POST   /admin/stores/:id/approve           ← sets status = LIVE (terminal approval)
POST   /admin/stores/:id/request-changes   ← non-terminal: status stays PENDING, owner resubmits
POST   /admin/stores/:id/reject            ← terminal: status = REJECTED, owner cannot resubmit
POST   /admin/categories                   ← create vertical or sub-category (ADMIN only)
GET    /admin/categories                   ← full platform taxonomy tree
PATCH  /admin/categories/:id              ← update category (ADMIN only)
```

## The Approve / Request-Changes / Reject Distinction

> [!IMPORTANT]
> These are three distinct actions — never collapse them into two.

| Action | Method | Store.status result | Terminal? |
|---|---|---|---|
| **Approve** | `approveStore()` | `LIVE` | Yes |
| **Request Changes** | `requestChanges()` | stays `PENDING` | **No** — owner can fix and resubmit |
| **Reject** | `rejectStore()` | `REJECTED` | Yes — owner cannot resubmit |

`requestChanges()` writes a `StoreApprovalQueue` row with `decision: REJECTED` but intentionally does **not** call `prisma.store.update()`. The store's `status` field is never touched.

See `DECISIONS.md §2` for full rationale.

## Category Taxonomy Scope

This sprint manages the **platform-wide** taxonomy only:
- Top-level nodes = **store verticals** (`Store.businessCategoryId` points here)
- Child nodes = **shared product sub-categories** (what `products.category_id` points to, enabling cross-store commission rules and campaigns)

**Deferred**: Store-owner-created sub-categories (a bakery's "Custom Cakes" section). The schema supports this with zero changes — it's just another row in the same table. The `@Roles('ADMIN')` guard is on the **controller**, not the service methods, so a future store-owner endpoint can call the same service without a rewrite. See `GAPS.md`.

## Deferred / Stubbed
- Store-owner-created sub-categories → future `store-web` sprint
- `StoreBilling` admin editing → read-only snapshot only this sprint (see `GAPS.md`)
