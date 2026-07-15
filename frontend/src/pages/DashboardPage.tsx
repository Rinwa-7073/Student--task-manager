import { Link } from 'react-router-dom';
import { StatisticsCards } from '@/components/tasks/StatisticsCards';
import { TaskTable } from '@/components/tasks/TaskTable';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTaskStatistics, useTasks } from '@/features/tasks/hooks/useTasks';

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useTaskStatistics();
  const { data: tasksData, isLoading: tasksLoading } = useTasks({
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const completed = stats?.byStatus.COMPLETED ?? 0;
  const pending = (stats?.total ?? 0) - completed;

  return (
    <div className="space-y-6">
      <StatisticsCards stats={stats} isLoading={statsLoading} />

      <Card>
        <CardHeader>
          <CardTitle>Overall progress</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading || !stats ? (
            <Skeleton className="h-2 w-full" />
          ) : (
            <>
              <ProgressBar
                value={completed}
                max={stats.total}
                label={`${completed} of ${stats.total} tasks completed`}
              />
              <p className="mt-3 font-mono text-xs text-secondary">
                {pending} pending · {stats.overdue} overdue
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-secondary">
            Recent tasks
          </h2>
          <Link to="/tasks" className="text-sm font-medium text-accent underline-offset-4 hover:underline">
            View all
          </Link>
        </div>
        <TaskTable tasks={tasksData?.items} isLoading={tasksLoading} />
      </div>
    </div>
  );
}
