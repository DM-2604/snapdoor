// packages/ui/src/components/stat-card.tsx
// Metric card for dashboards — label, large value, optional icon + trend indicator.
// Both admin-web and store-web use this via @localmart/ui.

'use client';
import * as React from 'react';
import { cn } from '../lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon, trend, trendUp, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-neutral-200 p-5 shadow-sm transition-shadow duration-200 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-neutral-900 tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <p className={cn('mt-3 text-xs font-medium', trendUp ? 'text-emerald-600' : 'text-neutral-500')}>
          {trend}
        </p>
      )}
    </div>
  );
}
