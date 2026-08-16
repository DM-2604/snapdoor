# Store-Admin-Web: Separation & API Wiring Plan (Revised)

## Background

`apps/store-web/` currently serves **two audiences** in the same Next.js app: the customer-facing storefront and a mock store-owner panel (`/admin/*`). The `/admin/*` section has polished UI but hardcoded data and no real API wiring. The actual backend store-owner APIs live under `STORE_OWNER` role guards on the NestJS API.

This plan separates them into two independent Next.js apps and wires the real backend to `apps/store-admin-web/`.

---

## ⚠️ Critical Notes Before Proceeding

> [!IMPORTANT]
> **Auth mechanism**: Store owners authenticate via **phone OTP** — `POST /api/v1/auth/otp/verify`. The JWT payload contains `role: 'STORE_OWNER'`. No email+password flow exists in the current backend.

> [!IMPORTANT]
> **KYC submit endpoint**: `POST /api/v1/store/submit-for-review` transitions `DRAFT → PENDING`. Documents are uploaded via `POST /api/v1/store/documents/upload-url` (new endpoint) then `POST /api/v1/store/documents`.

> [!IMPORTANT]
> **Dashboard endpoint**: No dedicated dashboard endpoint exists. Wire to `GET /api/v1/store/profile` + available endpoints.

---

## ✅ CRITICAL FIX 1 — Preserve & Migrate Existing UI

> [!WARNING]
> **Do NOT rebuild the store-admin UI from scratch.** The existing `apps/store-web/src/app/admin/` has polished, production-ready UI. Migrate these files — change only data sources.

### What to Migrate (move, not recreate)

| Current path in `store-web` | New path in `store-admin-web` | Action |
|---|---|---|
| `src/app/admin/layout.tsx` | `src/app/(store-owner)/layout.tsx` | Move + adapt (wire theme via local state, remove `useStore`) |
| `src/app/admin/page.tsx` | `src/app/(store-owner)/dashboard/page.tsx` | Move + wire API |
| `src/app/admin/products/page.tsx` | `src/app/(store-owner)/products/page.tsx` | Move + wire API |
| `src/app/admin/orders/page.tsx` | `src/app/(store-owner)/orders/page.tsx` | Move + wire API |
| `src/app/admin/analytics/page.tsx` | `src/app/(store-owner)/analytics/page.tsx` | Move + wire API |
| `src/app/admin/settings/page.tsx` | `src/app/(store-owner)/settings/page.tsx` | Move + wire API |
| `src/app/admin/login/page.tsx` | `src/app/login/page.tsx` | Move + adapt (OTP flow + httpOnly cookie) |
| `src/app/admin/register/page.tsx` | **Delete** | No self-registration per Decision A§9 |

### What Stays in `store-web`

| Path | Reason |
|---|---|
| All `src/app/` pages except `/admin/*` | Customer storefront |
| `src/app/sell/` | Customer-facing "become a seller" marketing page |
| `src/store/useStore.ts` | Customer cart/wishlist/location — keep as-is |
| `src/components/` | Customer-specific components |

### Migration Rules

- **Preserve all styling** — Tailwind classes, dark mode variants, layout structure.
- **Only change data sources** — replace hardcoded `const stats = [...]` with Zustand store calls that fetch from the API.
- **Shared primitives** — If any component in admin uses a primitive (Button, Card, Input) shared with `store-web`, move it to `packages/ui/` (preferred) or keep a local copy in `store-admin-web/src/components/ui/` for now.
- **Remove `useStore` dependency** — Admin layout uses `useStore` for `isDarkMode`. Replace with a local `useAdminTheme` hook that reads/writes `localStorage` directly, without depending on the customer store.

---

## ✅ CRITICAL FIX 2 — Eliminate Middleware API Call

> [!CAUTION]
> **The middleware MUST NOT call `/api/v1/store/profile` on every request.** This would add hundreds of milliseconds of latency and potentially DDoS your own API on every page load.

### Solution: JWT-local decode via `jose`

**Step 1 — Embed `storeStatus` in the JWT** (backend change):

When `POST /api/v1/auth/otp/verify` issues the JWT, the NestJS `JwtService` must include `storeStatus` in the payload:

```typescript
// apps/api/src/modules/identity/identity.service.ts (or auth service)
const payload = {
  sub: user.id,
  role: user.role,
  storeStatus: user.storeOwner?.store?.status ?? null, // 'DRAFT' | 'PENDING' | 'LIVE' | 'SUSPENDED' | null
};
const accessToken = this.jwtService.sign(payload);
```

**Step 2 — Decode JWT locally in middleware using `jose`**:

```typescript
// apps/store-admin-web/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const PUBLIC_PATHS = ['/login', '/api/'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('lm-store-token')?.value;

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next();
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  let payload: { role?: string; storeStatus?: string | null };
  try {
    const { payload: p } = await jwtVerify(token, JWT_SECRET);
    payload = p as typeof payload;
  } catch {
    // Token invalid/expired — clear cookie and redirect
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete('lm-store-token');
    return res;
  }

  // Role check
  if (payload.role !== 'STORE_OWNER') {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete('lm-store-token');
    return res;
  }

  const storeStatus = payload.storeStatus;

  // Non-LIVE → /kyc (unless already there)
  if (storeStatus !== 'LIVE' && !pathname.startsWith('/kyc')) {
    return NextResponse.redirect(new URL('/kyc', req.url));
  }
  // LIVE on /kyc → /dashboard
  if (storeStatus === 'LIVE' && pathname.startsWith('/kyc')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**Add `jose` to dependencies**:

```json
"jose": "^5.9.6"
```

**Add `JWT_SECRET` to `.env.local`**:

```bash
JWT_SECRET=change-me-to-a-secure-random-secret-min-32-chars
```

> [!NOTE]
> `JWT_SECRET` must match exactly what the NestJS API uses. Both apps share the same secret — in production use an environment variable manager (Doppler, Vault, etc.).

---

## ✅ CRITICAL FIX 3 — File Upload Pipeline via Supabase Storage

> [!IMPORTANT]
> The backend takes a `fileUrl` string — it does NOT accept raw file uploads. A file → storage → URL pipeline is required. Use **Supabase Storage** (free tier, no credit card, S3-compatible).

### Supabase Setup (one-time)

1. Create a free project at https://supabase.com
2. Go to **Storage** → **New bucket** → Name: `kyc-documents`
3. Set to **Public** for dev (or private with pre-signed URLs for prod)
4. Copy from **Settings → API**:
   - **Project URL** → `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
   - **`service_role` key** → `SUPABASE_SERVICE_ROLE_KEY` (backend only, never expose)
   - **`anon` key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend)

### Environment Variables

```bash
# Backend — apps/api/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Frontend — apps/store-admin-web/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Upload Flow (4 steps)

```
1. User selects file in browser
        ↓
2. Frontend → POST /api/v1/store/documents/upload-url
   Body: { docType: "PAN", fileName: "pan.pdf", contentType: "application/pdf" }
   Backend: generates pre-signed Supabase upload URL
   Returns: { uploadUrl: string, publicUrl: string }
        ↓
3. Frontend → PUT file directly to uploadUrl (Supabase pre-signed URL)
   No backend involvement — direct browser → Supabase upload
        ↓
4. Frontend → POST /api/v1/store/documents
   Body: { docType: "PAN", fileUrl: publicUrl }
   Backend: saves document record to DB
```

### New Backend Endpoint Required

Add to `StoreOwnerCatalogController` (or a new `StoreDocumentsController`):

```typescript
// POST /api/v1/store/documents/upload-url
@Post('documents/upload-url')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STORE_OWNER')
async getUploadUrl(
  @Body() dto: { docType: string; fileName: string; contentType: string },
  @CurrentUser() user: AuthenticatedUser,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const storeOwnerId = user.storeOwner.id;
  const ext = dto.fileName.split('.').pop();
  const path = `${storeOwnerId}/${dto.docType}-${Date.now()}.${ext}`;

  const { data, error } = await this.supabase.storage
    .from('kyc-documents')
    .createSignedUploadUrl(path);

  if (error) throw new InternalServerErrorException('Upload URL generation failed');

  const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/kyc-documents/${path}`;
  return { uploadUrl: data.signedUrl, publicUrl };
}
```

**Backend deps to add**:

```bash
npm install @supabase/supabase-js --workspace=apps/api
```

### New API Client Method

Add to `packages/api-client/src/endpoints/store-owner.ts`:

```typescript
// Request pre-signed upload URL from backend
getDocumentUploadUrl: (dto: { docType: string; fileName: string; contentType: string }) =>
  client.post<{ uploadUrl: string; publicUrl: string }>(
    '/api/v1/store/documents/upload-url',
    dto
  ),
```

### KYC Upload Component Logic

```typescript
// In document-upload-card.tsx
async function handleFileUpload(file: File, docType: string) {
  // Step 1: Get pre-signed URL from backend
  const { uploadUrl, publicUrl } = await storeOwnerApi.getDocumentUploadUrl({
    docType,
    fileName: file.name,
    contentType: file.type,
  });

  // Step 2: Upload file directly to Supabase
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  // Step 3: Register the public URL with the backend
  await storeOwnerApi.uploadDocument({ docType, fileUrl: publicUrl });
}
```

---

## Part 1 — Folder Structure

### `apps/store-admin-web/` Directory

```
apps/store-admin-web/
├── .env.local
├── middleware.ts                       # JWT decode via jose (CRITICAL FIX 2)
├── next.config.ts
├── tsconfig.json                       # Copy from admin-web
├── package.json
├── postcss.config.mjs
└── src/
    ├── app/
    │   ├── layout.tsx                  # ReactQueryProvider + fonts
    │   ├── globals.css                 # Copy from store-web admin styles
    │   ├── page.tsx                    # Redirect → /dashboard
    │   ├── login/
    │   │   └── page.tsx                # MIGRATED from store-web + OTP wiring
    │   ├── (store-owner)/
    │   │   ├── layout.tsx              # MIGRATED admin layout.tsx (adapted)
    │   │   ├── kyc/
    │   │   │   └── page.tsx            # NEW — KYC upload page
    │   │   ├── dashboard/
    │   │   │   └── page.tsx            # MIGRATED admin/page.tsx + API wiring
    │   │   ├── products/
    │   │   │   └── page.tsx            # MIGRATED admin/products/page.tsx + API
    │   │   ├── orders/
    │   │   │   └── page.tsx            # MIGRATED admin/orders/page.tsx + API
    │   │   ├── analytics/
    │   │   │   └── page.tsx            # MIGRATED admin/analytics/page.tsx + API
    │   │   └── settings/
    │   │       └── page.tsx            # MIGRATED admin/settings/page.tsx + API
    │   └── api/
    │       ├── auth/route.ts           # OTP verify → httpOnly cookie
    │       ├── session/route.ts        # Read cookie → return user+store
    │       └── proxy/[...path]/route.ts # Forward to NestJS
    ├── components/
    │   ├── providers/query-provider.tsx
    │   ├── kyc/
    │   │   ├── document-upload-card.tsx  # Supabase upload (CRITICAL FIX 3)
    │   │   └── kyc-status-banner.tsx
    │   └── ui/                           # Local copies of shared primitives
    ├── hooks/
    │   └── use-admin-theme.ts            # Local dark mode (replaces useStore)
    ├── lib/
    │   └── api.ts                        # ApiClient singleton
    └── stores/
        ├── index.ts
        ├── auth.store.ts
        ├── kyc.store.ts
        ├── dashboard.store.ts
        └── ui.store.ts
```

### `package.json` Dependencies

```json
{
  "name": "store-admin-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3002 --turbopack",
    "build": "next build",
    "start": "next start -p 3002"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.7.1",
    "@localmart/api-client": "*",
    "@localmart/ui": "*",
    "@radix-ui/react-dialog": "^1.1.23",
    "@tanstack/react-query": "^5.101.4",
    "clsx": "^2.1.1",
    "jose": "^5.9.6",
    "lucide-react": "^1.29.0",
    "next": "16.3.0",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "react-hook-form": "^7.84.0",
    "tailwind-merge": "^3.6.0",
    "zod": "^3.25.76",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### `.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_DEV_OTP_BYPASS=true
JWT_SECRET=change-me-to-a-secure-random-secret-min-32-chars

# Supabase (CRITICAL FIX 3)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Part 2 — Auth Flow

### Cookie Name

`lm-store-token` (distinct from platform admin's `lm-admin-token`).

### Route Handler: `src/app/api/auth/route.ts`

```
POST /api/auth:
  1. Proxy to NestJS POST /api/v1/auth/otp/verify
  2. Check user.role === 'STORE_OWNER' → else 403
  3. Set httpOnly cookie 'lm-store-token' (maxAge: 8h, sameSite: lax)
  4. Return { user }

DELETE /api/auth:
  1. Delete 'lm-store-token' cookie
  2. Return { ok: true }
```

### Route Handler: `src/app/api/session/route.ts`

```
GET /api/session:
  1. Read 'lm-store-token' cookie
  2. Forward to NestJS GET /api/v1/store/profile (Bearer token)
  3. Return { user, store }
```

### `use-admin-theme.ts` Hook (replaces `useStore` dependency)

```typescript
// src/hooks/use-admin-theme.ts
'use client';
import { useState, useEffect } from 'react';

export function useAdminTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('admin-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('admin-theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  return { isDark, toggle };
}
```

---

## Part 3 — API Client Extension

### Add `.delete<T>()` to `packages/api-client/src/client.ts`

```typescript
async delete<T>(path: string): Promise<T> {
  const res = await fetch(this.buildUrl(path), {
    method: 'DELETE',
    headers: this.headers(),
  });
  return this.unwrap<T>(res);
}
```

### New file: `packages/api-client/src/endpoints/store-owner.ts`

Key additions vs original plan:

```typescript
// New endpoint for CRITICAL FIX 3
getDocumentUploadUrl: (dto: { docType: string; fileName: string; contentType: string }) =>
  client.post<{ uploadUrl: string; publicUrl: string }>(
    '/api/v1/store/documents/upload-url',
    dto
  ),
```

Full endpoint list:
- `getProfile()` — `GET /api/v1/store/profile`
- `updateProfile(dto)` — `PATCH /api/v1/store/profile`
- `getKycStatus()` — `GET /api/v1/store/kyc-status`
- `listDocuments()` — `GET /api/v1/store/documents`
- `getDocumentUploadUrl(dto)` — `POST /api/v1/store/documents/upload-url` *(new)*
- `uploadDocument(dto)` — `POST /api/v1/store/documents`
- `submitForReview()` — `POST /api/v1/store/submit-for-review`
- `getOperatingHours()` — `GET /api/v1/store/operating-hours`
- `upsertOperatingHours(hours)` — `PUT /api/v1/store/operating-hours`
- `togglePause(paused, reason?)` — `POST /api/v1/store/toggle-pause`
- `listProducts(query?)` — `GET /api/v1/store/products`
- `createProduct(dto)` — `POST /api/v1/store/products`
- `updateProduct(id, dto)` — `PATCH /api/v1/store/products/:id`
- `deleteProduct(id)` — `DELETE /api/v1/store/products/:id`

---

## Part 4 — Zustand Stores

Follow A§15 rules from DECISIONS.md:
- One file per domain, `devtools` in dev, raw `create` in prod.
- Never store JWT. No form field state.

### Store Summary

| File | State | Key Actions |
|---|---|---|
| `auth.store.ts` | `currentUser`, `isAuthenticated` | `login()`, `logout()`, `setUser()` |
| `kyc.store.ts` | `kycStatus`, `documents`, `uploadingDocTypes` | `fetchKycStatus()`, `uploadDocument()`, `submitForReview()` |
| `dashboard.store.ts` | `profile`, `isLoading` | `fetchProfile()`, `updateProfile()` |
| `ui.store.ts` | `isSidebarCollapsed`, `toasts` | `toggleSidebar()`, `addToast()`, `removeToast()` |

---

## Part 5 — Backend Changes Summary

| Change | File | Type |
|---|---|---|
| Add `storeStatus` to JWT payload | `identity.service.ts` or `auth.service.ts` | **CRITICAL FIX 2** |
| New endpoint `POST /store/documents/upload-url` | `StoreOwnerCatalogController` | **CRITICAL FIX 3** |
| Install `@supabase/supabase-js` | `apps/api` | **CRITICAL FIX 3** |
| Add `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` to `.env` | `apps/api/.env` | **CRITICAL FIX 3** |

---

## Part 6 — store-web Cleanup (After store-admin-web is Live)

#### [DELETE] `apps/store-web/src/app/admin/` (entire directory)

UI has been migrated to `store-admin-web`. Delete only after smoke testing the new app.

#### [MODIFY] `apps/store-web/src/store/useStore.ts`

- Keep: cart, wishlist, city/location.
- Remove `isDarkMode`/`toggleDarkMode`/`setDarkMode` if unused by customer app after admin cleanup.

#### [MODIFY] Root `package.json`

Add `dev:store-admin` script:

```json
"dev:store-admin": "npm run dev --workspace=apps/store-admin-web"
```

---

## Verification Plan

1. **Bootstrap**: `npm run dev:store-admin` → loads on `localhost:3002` with migrated UI.
2. **Login guard**: Visit `localhost:3002/dashboard` without cookie → redirect to `/login`.
3. **Middleware speed**: Open DevTools Network — middleware should add <5ms (no API call).
4. **OTP login**: Phone → OTP → cookie set → redirect to `/kyc` (DRAFT) or `/dashboard` (LIVE).
5. **KYC upload**: Select file → upload to Supabase → document appears in list.
6. **Submit for review**: Button enabled after all docs uploaded → calls submit endpoint.
7. **Dashboard**: Store profile loads from API, stats displayed.
8. **store-web**: `localhost:3000/admin` returns 404 after cleanup.
9. **401 handling**: Tamper cookie → auto-redirect to `/login`.

---

## Port Assignments

| App | Dev Port | Command |
|---|---|---|
| `store-web` | 3000 | `npm run dev:store` |
| `api` (NestJS) | 3001 | `npm run dev:api` |
| `admin-web` (platform admin) | 3002 | `npm run dev:admin` |
| `store-admin-web` (seller panel) | 3003 | `npm run dev:store-admin` |

> [!WARNING]
> `admin-web` is currently also on port 3002. **Update `admin-web/package.json` dev script to `-p 3002`** and **`store-admin-web` to `-p 3003`** to avoid conflicts when both run simultaneously.
