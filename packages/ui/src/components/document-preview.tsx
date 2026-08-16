// packages/ui/src/components/document-preview.tsx
// Document preview component: shows image thumbnail inline with modal zoom,
// PDF shows a "View PDF →" link and an icon placeholder.

import * as React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { Modal } from './modal';
import { cn } from '../lib/utils';

interface DocumentPreviewProps {
  fileUrl: string | null;
  docType: string;
  className?: string;
}

function isPdf(url: string) {
  return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('pdf');
}

function isImage(url: string) {
  return /\.(jpe?g|png|gif|webp|bmp)(\?|$)/i.test(url);
}

export function DocumentPreview({ fileUrl, docType, className }: DocumentPreviewProps) {
  const [open, setOpen] = React.useState(false);
  const label = docType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  if (!fileUrl) {
    return (
      <div
        className={cn(
          'flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-[--color-neutral-200] bg-[--color-neutral-50] text-[--color-neutral-400]',
          className,
        )}
      >
        <FileText size={24} />
      </div>
    );
  }

  if (isImage(fileUrl)) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className={cn(
            'group relative h-24 w-24 overflow-hidden rounded-lg border border-[--color-surface-border] shadow-card',
            'hover:shadow-card-md transition-shadow duration-200',
            className,
          )}
          aria-label={`Preview ${label}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fileUrl}
            alt={label}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/20">
            <ExternalLink size={18} className="text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          </div>
        </button>

        <Modal open={open} onOpenChange={setOpen} title={label} maxWidth="max-w-2xl">
          <div className="flex items-center justify-center rounded-lg overflow-hidden bg-[--color-neutral-100] p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fileUrl} alt={label} className="max-h-[70vh] w-auto rounded object-contain" />
          </div>
          <div className="mt-3 flex justify-end">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-[--color-primary] hover:underline"
            >
              Open original <ExternalLink size={13} />
            </a>
          </div>
        </Modal>
      </>
    );
  }

  // PDF or unknown
  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-lg border border-[--color-surface-border] bg-[--color-surface-muted]',
        'text-xs font-medium text-[--color-neutral-500] hover:bg-[--color-primary-subtle] hover:text-[--color-primary] hover:border-[--color-primary-muted]',
        'transition-all duration-150',
        className,
      )}
      aria-label={`Open ${label}`}
    >
      <FileText size={22} />
      <span className="text-center leading-tight px-1">{isPdf(fileUrl) ? 'View PDF' : 'View File'}</span>
    </a>
  );
}
