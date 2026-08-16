# Documents Module

## Purpose
Owns all KYC document operations and payout account data. This is the **only** module that may query `Document` or `PayoutAccount` Prisma models — all other modules must call `DocumentsService`.

## Prisma Models Owned
- `Document`
- `PayoutAccount` *(service exists; admin UI deferred — see GAPS.md)*

## Endpoints Exposed

```
GET   /admin/documents?ownerType=STORE&ownerId=<uuid>   ← list KYC docs for a store/owner
POST  /admin/documents/:id/verify                        ← mark VERIFIED (admin JWT required)
POST  /admin/documents/:id/reject                        ← mark REJECTED (reason required)
```

## Key Rules

### rejectDocument does NOT change Store.status

> [!IMPORTANT]
> `rejectDocument()` rejects **one document** with a reason (e.g. "AADHAAR — image is blurry, please re-upload"). The `Store.status` is **not touched** — the store remains `PENDING` so the owner can re-upload and resubmit.
>
> Only `StoreCatalogService.rejectStore()` (terminal) changes `Store.status` to `REJECTED`.
> See `DECISIONS.md §2`.

## Deferred / Stubbed
- `PayoutAccount` verification UI: the service method exists (`DocumentsService.listByOwner` returns payout accounts' owning data), but there is no admin UI for approving/rejecting payout accounts this sprint.
  - **Swap point**: add a `verifyPayoutAccount(id, adminUserId)` method to `DocumentsService` + a controller endpoint when the UI is built.
