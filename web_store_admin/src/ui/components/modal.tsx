// packages/ui/src/components/modal.tsx
// Modal component backed by Radix UI Dialog — focus-trap, ESC-to-close, ARIA handled by Radix

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** Tailwind max-width class to control dialog width, e.g. "max-w-lg" */
  maxWidth?: string;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  maxWidth = 'max-w-md',
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop overlay */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />

        {/* Flex wrapper for guaranteed centering */}
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
          <Dialog.Content
            className={cn(
              // Position: relative to flex container
              'relative pointer-events-auto w-full',
              maxWidth,
              // Surface
              'bg-white rounded-2xl shadow-2xl border border-neutral-200',
              'p-6 focus:outline-none',
              // Animation (fade & zoom only, no slide)
              'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              // Scrollable content
              'max-h-[85vh] overflow-y-auto',
            className,
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <Dialog.Title className="text-base font-bold text-neutral-900">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-neutral-500">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="ml-4 shrink-0 rounded-lg p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </Dialog.Close>
          </div>

          {/* Body */}
          {children}
        </Dialog.Content>
      </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { Dialog };
