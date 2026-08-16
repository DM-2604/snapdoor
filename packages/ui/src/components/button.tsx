// packages/ui/src/components/button.tsx
// Button component with CVA variants

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-95',
        secondary:
          'bg-white border border-neutral-200 text-neutral-700 shadow-sm hover:bg-neutral-50 active:scale-95',
        danger:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-95',
        ghost:
          'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:scale-95',
        warning:
          'bg-amber-500 text-white shadow-sm hover:bg-amber-600 active:scale-95',
        outline:
          'border border-emerald-600 text-emerald-600 hover:bg-emerald-50 active:scale-95',
      },
      size: {
        sm:      'h-8  px-3 text-xs',
        default: 'h-9  px-4 py-2',
        lg:      'h-11 px-6 text-base',
        icon:    'h-9  w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
