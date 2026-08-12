// packages/ui/src/components/dropdown.tsx
// Typed dropdown menu backed by Radix UI DropdownMenu (focus-trap, keyboard nav, ARIA)

import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../lib/utils';

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  onClick: () => void;
}

export interface DropdownSeparator {
  type: 'separator';
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: (DropdownItem | DropdownSeparator)[];
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function Dropdown({ trigger, items, align = 'end', side = 'bottom' }: DropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          side={side}
          sideOffset={6}
          className={cn(
            'z-50 min-w-[160px] overflow-hidden rounded-xl border border-[--color-surface-border] bg-white',
            'p-1 shadow-[0_8px_24px_-4px_rgb(0,0,0,0.12)]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          )}
        >
          {items.map((item, i) => {
            if ('type' in item && item.type === 'separator') {
              return <DropdownMenu.Separator key={i} className="my-1 h-px bg-[--color-neutral-100]" />;
            }
            const { label, icon, variant = 'default', disabled, onClick } = item as DropdownItem;
            return (
              <DropdownMenu.Item
                key={i}
                disabled={disabled}
                onSelect={onClick}
                className={cn(
                  'flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors',
                  'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
                  variant === 'danger'
                    ? 'text-[--color-danger] focus:bg-[--color-danger-subtle]'
                    : 'text-[--color-neutral-700] focus:bg-[--color-surface-muted]',
                )}
              >
                {icon && <span className="shrink-0 text-[--color-neutral-400]">{icon}</span>}
                {label}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
