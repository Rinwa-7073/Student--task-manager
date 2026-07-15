import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  CATEGORY_LABEL,
  PRIORITY_BADGE_VARIANT,
  PRIORITY_LABEL,
  STATUS_BADGE_VARIANT,
  STATUS_LABEL,
  formatDueDate,
  isOverdue,
} from '@/features/tasks/taskDisplay';
import { cn } from '@/lib/cn';
import type { Task } from '@/types/task';

const PRIORITY_RAIL: Record<Task['priority'], string> = {
  HIGH: 'border-l-[color:var(--color-danger-500)]',
  MEDIUM: 'border-l-[color:var(--color-signal-500)]',
  LOW: 'border-l-[color:var(--border)]',
};

export function TaskCard({ task }: { task: Task }) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <Link to={`/tasks/${task.id}/edit`} className="block">
      <Card
        className={cn('border-l-4 transition-shadow hover:shadow-md', PRIORITY_RAIL[task.priority])}
      >
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm font-medium text-primary">{task.title}</p>
            <Badge variant="neutral" className="shrink-0">
              {CATEGORY_LABEL[task.category]}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]}>
              {PRIORITY_LABEL[task.priority]}
            </Badge>
            <Badge variant={STATUS_BADGE_VARIANT[task.status]}>{STATUS_LABEL[task.status]}</Badge>
          </div>

          <div
            className={cn(
              'flex items-center gap-1.5 font-mono text-xs text-secondary',
              overdue && 'text-[color:var(--color-danger-500)]',
            )}
          >
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDueDate(task.dueDate)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
