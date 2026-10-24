import { ListTodo, Clock, CheckCircle2, AlertCircle, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCardSkeleton } from '@/components/common/LoadingSkeletons';
import { formatMinutes } from '@/utils/timeFormat';
import type { TaskStatistics } from '@/types/task';

interface StatisticsCardsProps {
  stats: TaskStatistics | undefined;
  isLoading: boolean;
}

export function StatisticsCards({ stats, isLoading }: StatisticsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total tasks',
      value: String(stats.total),
      icon: ListTodo,
      tone: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    },
    {
      label: 'In progress',
      value: String(stats.byStatus.IN_PROGRESS),
      icon: Clock,
      tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    },
    {
      label: 'Completed',
      value: String(stats.byStatus.COMPLETED),
      icon: CheckCircle2,
      tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    },
    {
      label: 'Overdue',
      value: String(stats.overdue),
      icon: AlertCircle,
      tone: 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400',
    },
    {
      label: 'Study focus',
      value: formatMinutes(stats.totalLoggedMinutes ?? 0),
      icon: Timer,
      tone: 'bg-amber-50 text-accent dark:bg-amber-950/60 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <Card key={label} className="transition-all duration-150 hover:shadow-xs">
          <CardHeader className="flex-row items-center justify-between space-y-0 px-4 pb-2 pt-4">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              {label}
            </CardTitle>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-1">
            <p className="font-mono text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              {value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
