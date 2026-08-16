# DECISIONS.md — LocalMart Phase 1 & Store Owner Backend ADR Log

Lightweight Architecture Decision Record for non-obvious calls made during Phase 1 (Platform Admin) and Phase 2 (Store Owner Backend sprint).

---

## §1 — Tailwind CSS + CVA replaces vanilla CSS modules

**Decision**: `packages/ui` components are built with Tailwind utility classes and `class-variance-authority` (CVA) for variant props. A single shared preset at `packages/config/tailwind-preset.js` is extended by all apps.

**Rationale**: A shared preset enforces visual consistency across `admin-web` and (next sprint) `store-web` — they can never diverge. CVA makes variant props type-safe and removes prop-drilling of className strings. Radix UI primitives handle focus-trapping, ESC-to-close, and ARIA for Modal/ConfirmDialog, avoiding bug-prone hand-rolled implementations.

**Theme**: Light green and white — `primary.DEFAULT = #16a34a`, `primary.subtle = #dcfce7`, white surfaces. Light-only mode this sprint (no dark mode).

---

## §2 — `requestChanges` vs `rejectStore` are two distinct methods, not one

**Decision**: Three separate code paths exist:
- `StoreCatalogService.approveStore()` → `Store.status = LIVE`
- `StoreCatalogService.requestChanges()` → `Store.status` stays `PENDING` (owner can fix and resubmit)
- `StoreCatalogService.rejectStore()` → `Store.status = REJECTED` (terminal, owner cannot resubmit)

`requestChanges()` writes a `StoreApprovalQueue` row with `decision: REJECTED` but **never calls `prisma.store.update()`**.

**Rationale**: Collapsing request-changes and permanent rejection into a single "reject" action would break the resubmission flow. If an admin clicks "Request Changes" and the store goes to `REJECTED`, the owner has no path to fix issues. These are semantically different actions from the owner's perspective — one is feedback, the other is a final decision.

**Similarly**: `DocumentsService.rejectDocument()` rejects one document but does NOT change `Store.status`. The store stays PENDING so the owner can re-upload the specific document. Only `rejectStore()` changes the store's status.

---

## §3 — Zone boundary drawing deferred (centroid only this sprint)

**Decision**: Admin sets only a centroid lat/lng via a plain form field for Phase 1. Full polygon boundary drawing (map UI) is out of scope.

**Rationale**: Drawing zone polygons requires a map widget (Google Maps/Mapbox), event handling for polygon vertices, and significant frontend complexity. The centroid is sufficient for Phase 1 geographic grouping. The `zones.boundary` geometry column exists in the schema and the PostGIS extension is installed — zero schema changes needed to add boundary drawing later.

**Known limitation documented in**: `GAPS.md`.

---

## §4 — In-memory OTP rate limiter fallback (no Redis required for local dev)

**Decision**: Introduced `IOtpRateLimiter` interface with two implementations selected by `REDIS_ENABLED` env flag. Default is `InMemoryOtpRateLimiterService` (local dev, single-process Map with TTL).

**Rationale**: Without this, running `npm run dev:api` without Redis hard-crashes on OTP login. That defeats the purpose of not wiring Redis yet. The in-memory implementation is functionally correct for local dev (single process, short-lived). It logs a startup WARNING so it's never silently deployed to production.

**Swap point**: `identity.module.ts` → `OTP_RATE_LIMITER` provider (set `REDIS_ENABLED=true`).

---

## §5 — Notification stub writes `NotificationLog` row (not just a console.log)

**Decision**: `StoreNotificationSyncService` writes a `NotificationLog` DB row rather than just logging to console.

**Rationale**: A `NotificationLog` row is auditable (admin can see when a notification was "sent"), uses the existing template system, and makes the BullMQ swap trivial — the queue service will write the same row after dispatching the job. A pure console.log would be silently lost and non-auditable.

**BullMQ swap point**: `admin-ops.module.ts` → `STORE_NOTIFICATION_SERVICE` provider.

---

## §6 — Category taxonomy is platform-wide, not per-store

**Decision**: `Category` is a single self-referencing tree. Top-level nodes are store verticals (`stores.business_category_id` points here). Child nodes are shared product sub-categories (`products.category_id` points here). Admin manages the full taxonomy. Individual store owners cannot create their own categories this sprint.

**Rationale**: A platform-wide shared taxonomy is what makes cross-store campaigns and commission rules possible. "20% off all Dairy this weekend" requires that "Dairy" is one row every grocery store's dairy products point to — not something each store invents independently. If stores could create their own "Dairy" rows, that campaign would miss most products.

**Deferred**: Store-owner-created sub-categories (e.g. a bakery's "Custom Cakes" section). The schema supports this with zero changes — it's another row in the same table. See `GAPS.md`.

---

## §7 — `@Roles('ADMIN')` at controller, not service, for category endpoints

**Decision**: The `createCategory`, `listCategories`, `updateCategory` service methods in `StoreCatalogService` carry no role guard. Only the controller class has `@Roles('ADMIN')`.

**Rationale**: A future store-owner-facing endpoint (in `store-web` sprint) needs to call the same service methods to let owners browse the platform taxonomy (to assign their products to categories). If the guard were on the service, that endpoint would either bypass security or require duplicating the service. With the guard on the controller only, the future endpoint simply calls the same service with its own controller-level `@Roles('STORE_OWNER')` guard.

---

## §8 — POS Walk-in Orders: Direct Decrement, Zero Commission, and Automatic Sales Invoicing

**Decision**: In-store POS walk-in purchases are recorded via `POST /api/v1/store/orders/pos` with `channel = POS`, `status = COMPLETED`, `fulfillmentType = TAKEAWAY`, and hardcoded `commissionPercentApplied = 0` and `commissionAmount = 0`. Stock is directly decremented via `InventoryService.decrementDirectStock`, and a tax `SalesInvoice` is generated immediately.

**Rationale**: Walk-in sales are offline customer interactions processed through the merchant's store counter. LocalMart charges 0% commission on walk-in POS sales as a merchant SaaS value-add. Bypassing online reservation-locking prevents cart timeouts while ensuring real-time stock sync between online and physical shelves.

---

## §9 — Admin-Initiated Onboarding & Single-Store Context Scoping

**Decision**: Stores are exclusively provisioned by Platform Admins (`POST /api/v1/admin/stores`) in `DRAFT` status with an assigned `ownerPhoneNumber`. Self-serve public registration is completely removed. Store owners authenticate via phone OTP, after which `StoreOwnerGuard` automatically resolves and binds `request.store` by querying `ownerUserId`.

**Rationale**: Eliminates multi-step unverified self-registration spam and ensures strict vertical and geographic taxonomy assignment from day one. In Phase 1 & 2, each `STORE_OWNER` user maps 1:1 to their store, avoiding multi-tenant switching complexity while maintaining full data isolation.

---

## §10 — Non-Soft-Deletable Sales Invoices for Statutory Compliance

**Decision**: `SalesInvoice` is explicitly excluded from `SOFT_DELETABLE_MODELS`. Any deletion attempt is rejected.

**Rationale**: Indian GST laws require immutable tax invoice series and permanent records for B2C/B2B customer invoicing. Soft-deleting sales tax invoices could lead to statutory audit non-compliance.

---

## §11 — Controller-Level Resource Ownership Validation (The "Bare Param" Rule)

**Decision**: Any controller method that accepts a bare resource ID (e.g. `storeId`, `variantId`, `paymentId`) from a client request and serves multiple roles (e.g. `STORE_OWNER`, `CUSTOMER`, `ADMIN`) must explicitly validate that the caller *owns* the resource before proceeding. For `STORE_OWNER`, we use a lightweight shared guard/helper `verifyStoreOwnership` (or inline validation) to ensure `resource.storeId === callerStoreId`.

**Rationale**: Relying solely on `@CurrentStore()` or `@CurrentUser()` is insufficient when a bare ID is passed. Without explicit ownership validation, an authenticated store owner could pass another store's `storeId` or `variantId` and improperly read/modify data that isn't theirs. This applies to inventory, payments, and ratings replies. `ADMIN` callers are generally exempt, and `CUSTOMER` callers are checked against `resource.customerId`.

---

## §12 — Transaction + Row-Locking for Inventory Reservation

**Decision**: Order creation and stock reservation are strictly wrapped in a single database transaction (`prisma.$transaction`). Inside this transaction, we use PostgreSQL's `SELECT ... FOR UPDATE` via `tx.$queryRaw` to row-lock the inventory record *before* checking stock availability and reserving/decrementing it. This applies to online checkouts (`reserveStock`), POS walk-ins (`decrementDirectStock`), and committing reserves.

**Rationale**: This is the one piece of the codebase where correctness genuinely depends on atomic concurrency control. Without row-locking, two simultaneous checkout requests for the last unit of stock could both read `quantity > 0` before either writes, resulting in an oversell. The `FOR UPDATE` lock forces the second transaction to wait until the first commits, at which point it reads the updated quantity (0) and safely fails. Wrapping it with order creation ensures we never create phantom orders if stock reservation fails.

---

## §13 — STANDING RULE: Scalable Folder Structure (enforced permanently)

**Decision**: New code always goes in the module / route folder that already owns the relevant data model or feature. No new top-level module or feature folder may be created without first confirming that no existing module already owns the data.

**Backend rule**: New backend code goes in the module that owns the relevant Prisma model per the existing module-ownership map:
- `store-catalog` → Store, StoreApprovalQueue, Category
- `platform-config` → City, Zone, CommissionRule, PlatformFeePlan, PlatformSetting
- `admin-ops` → AuditLog, admin dashboard aggregates
- `billing` → StoreBilling, Invoice, Settlement, PayoutAccount
- `documents` → Document
- `identity` → User, AdminUser, StoreOwner, OTP
- `order` → Order, CartReservation
- `inventory` → InventoryItem, InventoryReservation
- `fulfillment` → DeliverySlot, Fulfillment
- `merchandising` → Product, ProductVariant, Campaign, Discount

**Frontend rule**: Feature-scoped code lives under its feature's route folder (e.g. `app/(admin)/commission/`). Truly shared code (components, stores, api client, types) lives in the designated shared location (`packages/ui`, `src/stores`, `packages/api-client`) — never duplicated locally "for now."

**Rationale**: This project has twice paid cleanup costs from skipping this check — orphaned `admin/catalog/commission/store` stubs and the `notification/order/payment` stub-vs-real collision. Both required retroactive cleanup. The rule prevents recurrence.

---

## §14 — STANDING RULE: No Temp Regex Fixes (enforced permanently)

**Decision**: A bug fix must address the actual root cause with proper typed code — not a quick find-and-replace, a regex-based string patch, or a narrow special-case branch that makes the immediate symptom disappear without fixing the underlying logic.

**If a fix feels like "just add a regex/string check here to catch this one case"**, that is a signal to find the actual root cause instead.

**Rationale**: This project has had three examples of this failure mode, all corrected by going to root cause:
1. Store-hours string-vs-Date comparison bug — regex workaround was proposed; fixed properly by correcting the type comparison.
2. 4-tier sale resolution bug — narrow special-case branch was proposed; fixed properly by correcting the tier resolution logic.
3. Transaction-wrapping gaps — ad-hoc retry was proposed; fixed properly by wrapping the correct operations in a `prisma.$transaction`.

**When uncertain**: If it is genuinely unclear whether a proposed fix is a root-cause fix or a patch, say so explicitly in the plan rather than presenting a patch as a complete fix. Uncertainty is acceptable; silent patching is not.

---

## §15 — Unified State Management with Zustand (admin-web)

**Decision**: In `admin-web`, Zustand is the unified state manager for *both* UI ephemeral state (modals, sidebars) and server-fetched entity data caching (store lists, categories, commission rules, etc.). We use domain-specific stores (e.g., `dashboard.store.ts`, `commission.store.ts`) rather than a single monolithic store.

**Exceptions**: Highly volatile, single-component form state (e.g., controlled text inputs like `categoryName` or `rulePercent`) is kept local via `useState` or `react-hook-form` to prevent unnecessary global re-renders. Everything else (fetched data, loading flags, pagination, modal open/close states, filters) belongs in Zustand.

**Rationale**: This deliberately overrides a previous implicit boundary that restricted Zustand to client-only session state. Consolidating all data fetching and UI state into domain-specific Zustand stores provides a scalable architecture, prevents prop-drilling, allows data to persist across tab navigation (instant back-navigation), and creates a single source of truth for the application's state.


---

## �16 � Strict Atomicity for Cross-Service Writes

**Decision**: Any cross-service DB writes (e.g., AuditLog) triggered as part of a larger operation (e.g., store creation) must be provided the ongoing transaction client (	x) to ensure strict atomicity. Services that log or record side-effects (like AuditLogService) have been updated to accept an optional Prisma.TransactionClient.

**Rationale**: Firing an independent prisma.create() query inside an ongoing transaction callback spawns a new connection, which exhausts the connection pool under load (deadlocks) and completely breaks atomicity. If the side-effect fails, the parent transaction must roll back with it.
