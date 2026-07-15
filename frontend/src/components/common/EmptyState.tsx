import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Standard "nothing here yet" pattern: an empty screen is an invitation
 * to act, so this always pairs a plain-language explanation with an
 * optional action rather than leaving a dead end.
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-default px-6 py-16 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
        <Icon className="h-6 w-6 text-secondary" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="font-display text-base font-bold text-primary">{title}</p>
        {description && <p className="max-w-sm text-sm text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}
