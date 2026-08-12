// packages/ui/src/lib/utils.ts
// Utility for merging Tailwind class names (cn helper)

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
