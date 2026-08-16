// packages/ui/src/components/spinner.tsx
// Loading spinner + full-page loading state.
// Both admin-web and store-web use this via @localmart/ui.

'use client';
import * as React from 'react';
import { cn } from '../lib/utils';

export function Spinner({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-[--color-primary-muted] border-t-[--color-primary]',
        className,
      )}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Spinner size={36} />
    </div>
  );
}
