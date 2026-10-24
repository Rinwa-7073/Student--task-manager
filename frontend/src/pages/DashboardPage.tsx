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

  const total = stats?.total ?? 0;
  const completed = stats?.byStatus.COMPLETED ?? 0;
  const pending = total - completed;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <StatisticsCards stats={stats} isLoading={statsLoading} />

      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-primary">Overall progress</CardTitle>
              <p className="mt-0.5 text-xs text-secondary">
                Track how close you are to completing all academic and prep tasks
              </p>
            </div>
            {stats && (
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl font-extrabold text-accent">
                  {completionPercentage}%
                </span>
                <span className="text-xs text-secondary">done</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {statsLoading || !stats ? (
            <Skeleton className="h-2.5 w-full rounded-full" />
          ) : (
            <>
              <ProgressBar
                value={completed}
                max={stats.total}
                label={`${completed} of ${stats.total} tasks completed (${completionPercentage}%)`}
              />
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {completed} Completed
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  {pending} Pending
                </span>
                {stats.overdue > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 font-medium text-red-800 dark:bg-red-950/50 dark:text-red-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {stats.overdue} Overdue
                  </span>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-primary">Recent tasks</h2>
            <p className="text-xs text-secondary">Latest tasks added to your workspace</p>
          </div>
          <Link
            to="/tasks"
            className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            View all tasks →
          </Link>
        </div>
        <TaskTable tasks={tasksData?.items} isLoading={tasksLoading} />
      </div>
    </div>
  );
}
