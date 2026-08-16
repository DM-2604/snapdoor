// packages/ui/src/components/badge.tsx
// Badge component with per-StoreStatus CVA variants

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        // StoreStatus values
        PENDING:   'bg-warning-subtle text-warning-dark border border-warning-light',
        LIVE:      'bg-success-subtle text-success border border-primary-muted',
        REJECTED:  'bg-danger-subtle text-danger-dark border border-danger-light',
        SUSPENDED: 'bg-neutral-100 text-neutral-600 border border-neutral-300',
        // DocumentVerificationStatus values
        VERIFIED:  'bg-success-subtle text-success border border-primary-muted',
        // Generic
        default:   'bg-neutral-100 text-neutral-700 border border-neutral-200',
        success:   'bg-success-subtle text-success border border-primary-muted',
        warning:   'bg-warning-subtle text-warning-dark border border-warning-light',
        danger:    'bg-danger-subtle text-danger-dark border border-danger-light',
        neutral:   'bg-neutral-100 text-neutral-700 border border-neutral-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
