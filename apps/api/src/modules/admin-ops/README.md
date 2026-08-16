# Admin Ops Module

## Purpose
Provides platform-wide audit logging, admin dashboard summary, and store approval notifications.

## Prisma Models Owned
- `AuditLog` (append-only — no updates, no deletes)
- `NotificationLog` (written by StoreNotificationSyncService)
- `StoreApprovalQueue` is owned by **StoreCatalogModule** — AdminOps reads it indirectly via dashboard counts

## Endpoints Exposed

```
GET /admin/dashboard/summary     ← stores by status, zones per city, active fee plans, pending docs
GET /admin/audit-logs?entityType=&entityId=&actorUserId=&page=&limit=
```

## Store Notification Service

The `STORE_NOTIFICATION_SERVICE` token is DI-injectable:

| Env | Implementation | Notes |
|---|---|---|
| default | `StoreNotificationSyncService` | Writes `NotificationLog` row synchronously |
| (future) | `StoreNotificationQueueService` | BullMQ job when Redis is wired |

**Swap point**: `admin-ops.module.ts` → `STORE_NOTIFICATION_SERVICE` provider (line ~17).

## Deferred / Stubbed
- Real BullMQ wiring for store notifications → see `GAPS.md`
- `AuditLog` admin editing is intentionally impossible — the table is append-only
