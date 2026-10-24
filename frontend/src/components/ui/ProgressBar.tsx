import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, max, label, className }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-secondary">{label}</span>
          <span className="font-mono font-semibold text-primary">{pct}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/70 dark:bg-slate-800 dark:border-slate-700"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
