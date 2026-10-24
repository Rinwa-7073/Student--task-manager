import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Calendar, ListChecks, Check, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TaskTableSkeleton } from '@/components/common/LoadingSkeletons';
import { FocusTimerDialog } from '@/components/tasks/FocusTimerDialog';
import { formatMinutes } from '@/utils/timeFormat';
import {
  CATEGORY_LABEL,
  PRIORITY_BADGE_VARIANT,
  PRIORITY_LABEL,
  STATUS_BADGE_VARIANT,
  STATUS_LABEL,
  formatDueDate,
  isOverdue,
} from '@/features/tasks/taskDisplay';
import { useDeleteTask, useToggleComplete } from '@/features/tasks/hooks/useTaskMutations';
import { cn } from '@/lib/cn';
import type { Task } from '@/types/task';

interface TaskTableProps {
  tasks: Task[] | undefined;
  isLoading: boolean;
}

export function TaskTable({ tasks, isLoading }: TaskTableProps) {
  const deleteTask = useDeleteTask();
  const toggleComplete = useToggleComplete();
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  if (isLoading) return <TaskTableSkeleton />;

  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No tasks yet"
        description="Create your first task to start tracking DSA practice, applications, and interview prep."
        action={
          <Link
            to="/tasks/new"
            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            Create a task
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-default bg-surface shadow-xs">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-default bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-secondary dark:bg-surface-2/70">
              <th className="w-10 px-4 py-3" aria-label="Complete" />
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Focus</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default">
            {tasks.map((task) => {
              const overdue = isOverdue(task.dueDate, task.status);
              const completed = task.status === 'COMPLETED';
              return (
                <tr
                  key={task.id}
                  className={cn(
                    'transition-colors hover:bg-slate-50/70 dark:hover:bg-surface-2/40',
                    completed && 'opacity-65',
                  )}
                >
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={completed}
                      aria-label={completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
                      onClick={() => toggleComplete.mutate(task.id)}
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-md border transition-colors',
                        completed
                          ? 'border-[color:var(--color-success-500)] bg-[color:var(--color-success-500)] text-white shadow-2xs'
                          : 'border-slate-300 bg-white text-transparent hover:border-accent dark:border-slate-600 dark:bg-slate-800',
                      )}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </button>
                  </td>
                  <td
                    className={cn(
                      'max-w-[280px] truncate px-4 py-3.5 font-medium text-primary',
                      completed && 'line-through text-muted',
                    )}
                  >
                    {task.title}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant="neutral">{CATEGORY_LABEL[task.category]}</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]}>
                      {PRIORITY_LABEL[task.priority]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={STATUS_BADGE_VARIANT[task.status]}>{STATUS_LABEL[task.status]}</Badge>
                  </td>
                  <td
                    className={cn(
                      'whitespace-nowrap px-4 py-3.5 font-mono text-xs text-secondary',
                      overdue && 'font-semibold text-red-600 dark:text-red-400',
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatDueDate(task.dueDate)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-secondary">
                    <span
                      className="inline-flex items-center gap-1 rounded-md bg-surface-2/70 px-2 py-0.5 font-medium transition-colors hover:bg-surface-2"
                      title={task.estimatedMinutes ? `Goal: ${formatMinutes(task.estimatedMinutes)}` : 'Study focus time'}
                    >
                      <Timer className="h-3.5 w-3.5 text-accent" />
                      <span className="text-primary">{formatMinutes(task.loggedMinutes)}</span>
                      {task.estimatedMinutes ? (
                        <span className="text-[11px] text-muted">/{formatMinutes(task.estimatedMinutes)}</span>
                      ) : null}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Start study session for ${task.title}`}
                        title="Focus Study Timer"
                        onClick={() => setFocusTask(task)}
                        className="text-secondary hover:text-accent hover:bg-amber-50 dark:hover:bg-amber-950/40"
                      >
                        <Timer className="h-4 w-4 text-accent" />
                      </Button>
                      <Link
                        to={`/tasks/${task.id}/edit`}
                        aria-label={`Edit ${task.title}`}
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'icon' }),
                          'text-secondary hover:text-primary hover:bg-surface-2',
                        )}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${task.title}`}
                        onClick={() => setPendingDelete(task)}
                        className="text-secondary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <FocusTimerDialog
        task={focusTask}
        open={focusTask !== null}
        onClose={() => setFocusTask(null)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this task?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently removed. This can't be undone.` : undefined}
        confirmLabel="Delete task"
        isConfirming={deleteTask.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteTask.mutate(pendingDelete.id);
            setPendingDelete(null);
          }
        }}
      />
    </>
  );
}
