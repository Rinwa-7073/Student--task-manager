import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-white font-semibold hover:bg-[color:var(--accent-hover)] shadow-xs active:scale-[0.99]',
        secondary:
          'bg-surface-2 text-primary hover:bg-slate-200/70 border border-default font-medium',
        outline:
          'border border-default bg-surface text-primary hover:bg-surface-2 hover:border-slate-300 font-medium shadow-2xs',
        ghost:
          'bg-transparent text-secondary hover:bg-surface-2 hover:text-primary font-medium',
        destructive:
          'bg-[color:var(--color-danger-500)] text-white hover:bg-[color:var(--color-danger-600)] shadow-xs font-semibold',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';

export { buttonVariants };
