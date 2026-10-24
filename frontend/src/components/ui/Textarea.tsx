import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'min-h-[96px] w-full resize-y rounded-lg border border-default bg-surface px-3.5 py-2.5 text-sm text-primary placeholder:text-muted shadow-2xs transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:border-accent',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-2',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
