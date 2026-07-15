import { ListTodo, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCardSkeleton } from '@/components/common/LoadingSkeletons';
import type { TaskStatistics } from '@/types/task';

interface StatisticsCardsProps {
  stats: TaskStatistics | undefined;
  isLoading: boolean;
}

export function StatisticsCards({ stats, isLoading }: StatisticsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total tasks', value: stats.total, icon: ListTodo, tone: 'text-primary' },
    {
      label: 'In progress',
      value: stats.byStatus.IN_PROGRESS,
      icon: Clock,
      tone: 'text-[color:var(--color-info-500)]',
    },
    {
      label: 'Completed',
      value: stats.byStatus.COMPLETED,
      icon: CheckCircle2,
      tone: 'text-[color:var(--color-success-500)]',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: AlertCircle,
      tone: 'text-[color:var(--color-danger-500)]',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
