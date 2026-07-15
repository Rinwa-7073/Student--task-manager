import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide',
  {
    variants: {
      variant: {
        neutral: 'border-default bg-surface-2 text-secondary',
        signal:
          'border-[color:var(--color-signal-500)]/30 bg-[color:var(--color-signal-500)]/10 text-[color:var(--color-signal-600)] dark:text-[color:var(--color-signal-400)]',
        success:
          'border-[color:var(--color-success-500)]/30 bg-[color:var(--color-success-500)]/10 text-[color:var(--color-success-500)]',
        danger:
          'border-[color:var(--color-danger-500)]/30 bg-[color:var(--color-danger-500)]/10 text-[color:var(--color-danger-500)]',
        info: 'border-[color:var(--color-info-500)]/30 bg-[color:var(--color-info-500)]/10 text-[color:var(--color-info-500)]',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
