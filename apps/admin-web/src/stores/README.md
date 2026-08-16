# stores/ — Unified State Management

This directory contains all Zustand stores for `admin-web`.

## The Rule: Unified State Management

**Belongs here** (Unified State):
- **Server-Fetched Entity Data**: Store lists, dashboard summaries, commission rules, fee plans, geography, categories, audit logs. Caching this data in Zustand prevents prop-drilling, unifies data access, and allows for instant back-navigation.
- **Client Session / UI State**: Which admin is logged in (`useAuthStore`), which modal is currently open (`useUIStore`, domain stores), sidebar state, toast queues, filters, and pagination states.

**Does NOT belong here** (Highly Volatile State):
- Highly volatile, single-component form state (e.g., individual keystrokes in a text input like `categoryName` or `rulePercent`). Keep these local via `useState` or `react-hook-form` to prevent unnecessary global re-renders.

## Files

| File | Store | Owns |
|---|---|---|
| `auth.store.ts` | `useAuthStore` | `currentUser`, `role`, `isAuthenticated`, `login()`, `logout()` |
| `ui.store.ts` | `useUIStore` | `approveModalStoreId`, `sidebarCollapsed`, `toasts[]` |
| `dashboard.store.ts` | `useDashboardStore` | Dashboard summary metrics and loading state |
| `geography.store.ts` | `useGeographyStore` | Cities, zones, and related loading/modal states |
| `commission.store.ts` | `useCommissionStore` | Commission rules, fee plans, and related loading/modal states |
| `store-catalog.store.ts` | `useStoreCatalogStore` | Store list, pagination, filters, store detail, approval queues |
| `category.store.ts` | `useCategoryStore` | Category taxonomy tree and loading/modal states |
| `audit.store.ts` | `useAuditStore` | Audit logs, pagination, filters, loading states |
| `settings.store.ts` | `useSettingsStore` | Platform settings map and loading state |
| `index.ts` | barrel | re-exports all stores and their types |
