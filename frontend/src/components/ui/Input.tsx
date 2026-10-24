import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-lg border border-default bg-surface px-3.5 text-sm text-primary placeholder:text-muted shadow-2xs transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:border-accent',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-2',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
