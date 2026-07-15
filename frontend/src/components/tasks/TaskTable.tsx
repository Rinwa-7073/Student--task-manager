import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Calendar, ListChecks, Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TaskTableSkeleton } from '@/components/common/LoadingSkeletons';
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
      <div className="overflow-x-auto rounded-xl border border-default bg-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-default text-xs uppercase tracking-wide text-secondary">
              <th className="w-10 px-4 py-3 font-medium" aria-label="Complete" />
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const overdue = isOverdue(task.dueDate, task.status);
              const completed = task.status === 'COMPLETED';
              return (
                <tr
                  key={task.id}
                  className={cn(
                    'border-b border-default last:border-0 hover:bg-surface-2/50',
                    completed && 'opacity-60',
                  )}
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={completed}
                      aria-label={completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
                      onClick={() => toggleComplete.mutate(task.id)}
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                        completed
                          ? 'border-[color:var(--color-success-500)] bg-[color:var(--color-success-500)] text-white'
                          : 'border-default text-transparent hover:border-accent',
                      )}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </button>
                  </td>
                  <td
                    className={cn(
                      'max-w-[280px] truncate px-4 py-3 font-medium text-primary',
                      completed && 'line-through',
                    )}
                  >
                    {task.title}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral">{CATEGORY_LABEL[task.category]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]}>
                      {PRIORITY_LABEL[task.priority]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE_VARIANT[task.status]}>{STATUS_LABEL[task.status]}</Badge>
                  </td>
                  <td
                    className={cn(
                      'whitespace-nowrap px-4 py-3 font-mono text-xs text-secondary',
                      overdue && 'font-semibold text-[color:var(--color-danger-500)]',
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatDueDate(task.dueDate)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/tasks/${task.id}/edit`}
                        aria-label={`Edit ${task.title}`}
                        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${task.title}`}
                        onClick={() => setPendingDelete(task)}
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
