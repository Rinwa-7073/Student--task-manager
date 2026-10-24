import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide',
  {
    variants: {
      variant: {
        neutral:
          'border-slate-200 bg-slate-100/90 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
        signal:
          'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300',
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300',
        danger:
          'border-red-200 bg-red-50 text-red-800 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300',
        info:
          'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300',
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
