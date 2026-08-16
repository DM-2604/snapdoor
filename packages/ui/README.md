// packages/ui/README.md
# @localmart/ui

Shared React component library for the LocalMart platform. Built with **Tailwind CSS utility classes** + **class-variance-authority (CVA)** for type-safe variant props, and **Radix UI** primitives for accessible interactive components.

---

## Design Principles

1. **Tailwind over inline styles** — All styling uses Tailwind utility classes. CSS custom properties defined in `globals.css` via `@theme` are referenced using `[--color-*]` syntax to remain compatible with both Tailwind v3 and v4.
2. **CVA for variants** — Any component with multiple visual states (e.g. Button's `primary/danger/ghost`, Badge's StoreStatus colors) uses `cva()` for type-safe variant props. Never add variant logic via `if/else` on `className` strings.
3. **Radix UI for interactive primitives** — Modal, Dropdown, and Tooltip are all backed by Radix UI. We get focus-trapping, keyboard navigation, ESC-to-close, and ARIA roles for free. Do **not** hand-roll these behaviors.

---

## Components

| Component | File | Radix Primitive | CVA |
|---|---|---|---|
| `<Button>` | `button.tsx` | – | ✅ (`variant`, `size`) |
| `<Badge>` | `badge.tsx` | – | ✅ (`variant` keyed to `StoreStatus`) |
| `<Modal>` | `modal.tsx` | `@radix-ui/react-dialog` | – |
| `<Table>` | `table.tsx` | – | – |
| `<Dropdown>` | `dropdown.tsx` | `@radix-ui/react-dropdown-menu` | – |
| `<Tooltip>` | `tooltip.tsx` | `@radix-ui/react-tooltip` | – |
| `<DocumentPreview>` | `document-preview.tsx` | uses `<Modal>` | – |
| `cn()` | `lib/utils.ts` | – | – |

---

## Adding a New Component

1. Create `packages/ui/src/components/<name>.tsx`.
2. If the component has multiple visual states → use `cva()` for variants.
3. If the component requires focus management, keyboard nav, or ARIA → use a Radix UI primitive.
4. Export from `packages/ui/src/index.ts`.
5. Document here in this README.

---

## Variant Naming Rules

- Status variants are named after the exact Prisma enum value: `PENDING`, `LIVE`, `REJECTED`, `SUSPENDED`, `VERIFIED`.
- Generic variants use lowercase descriptive names: `primary`, `secondary`, `danger`, `ghost`, `warning`, `outline`.
- Never use color names (`green`, `red`) as variant identifiers — use semantic names instead.

---

## CVA Example

```tsx
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'base-classes-here', // base
  {
    variants: {
      variant: {
        primary: 'bg-[--color-primary] text-white',
        danger:  'bg-[--color-danger] text-white',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);
```
