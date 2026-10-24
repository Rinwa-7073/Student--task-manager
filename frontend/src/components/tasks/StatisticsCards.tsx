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
    { label: 'Total tasks', value: String(stats.total), icon: ListTodo, tone: 'text-primary' },
    {
      label: 'In progress',
      value: String(stats.byStatus.IN_PROGRESS),
      icon: Clock,
      tone: 'text-[color:var(--color-info-500)]',
    },
    {
      label: 'Completed',
      value: String(stats.byStatus.COMPLETED),
      icon: CheckCircle2,
      tone: 'text-[color:var(--color-success-500)]',
    },
    {
      label: 'Overdue',
      value: String(stats.overdue),
      icon: AlertCircle,
      tone: 'text-[color:var(--color-danger-500)]',
    },
    {
      label: 'Study focus',
      value: formatMinutes(stats.totalLoggedMinutes ?? 0),
      icon: Timer,
      tone: 'text-accent',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <Card key={label}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-secondary">
              {label}
            </CardTitle>
            <Icon className={`h-4 w-4 ${tone}`} aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-semibold text-primary">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
