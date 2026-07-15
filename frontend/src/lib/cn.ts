import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names, resolving Tailwind conflicts intelligently
 * (e.g. `cn('px-2', 'px-4')` → `'px-4'`). The standard utility used
 * across every shadcn/ui-style component.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
