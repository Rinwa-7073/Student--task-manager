import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TaskTable } from '@/components/tasks/TaskTable';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { CATEGORY_LABEL, PRIORITY_LABEL, STATUS_LABEL } from '@/features/tasks/taskDisplay';
import { TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES, type TaskListParams } from '@/types/task';

const SORT_OPTIONS: { value: `${NonNullable<TaskListParams['sortBy']>}:${NonNullable<TaskListParams['sortOrder']>}`; label: string }[] = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'dueDate:asc', label: 'Due soonest' },
  { value: 'dueDate:desc', label: 'Due latest' },
  { value: 'priority:desc', label: 'Priority (high first)' },
  { value: 'title:asc', label: 'Title (A–Z)' },
];

export function TasksPage() {
  const [filters, setFilters] = useState<TaskListParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, isPlaceholderData } = useTasks({
    ...filters,
    search: debouncedSearch || undefined,
  });

  const updateFilter = <K extends keyof TaskListParams>(key: K, value: TaskListParams[K]) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        <Select
          className="w-auto"
          value={filters.status ?? ''}
          onChange={(e) => updateFilter('status', (e.target.value || undefined) as TaskListParams['status'])}
        >
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>

        <Select
          className="w-auto"
          value={filters.priority ?? ''}
          onChange={(e) =>
            updateFilter('priority', (e.target.value || undefined) as TaskListParams['priority'])
          }
        >
          <option value="">All priorities</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </Select>

        <Select
          className="w-auto"
          value={filters.category ?? ''}
          onChange={(e) =>
            updateFilter('category', (e.target.value || undefined) as TaskListParams['category'])
          }
        >
          <option value="">All categories</option>
          {TASK_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </Select>

        <Select
          className="ml-auto w-auto"
          value={`${filters.sortBy}:${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split(':') as [
              NonNullable<TaskListParams['sortBy']>,
              NonNullable<TaskListParams['sortOrder']>,
            ];
            setFilters((f) => ({ ...f, sortBy, sortOrder, page: 1 }));
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <TaskTable tasks={data?.items} isLoading={isLoading} />

      {data?.meta && data.meta.total > 0 && (
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-secondary">
            Page {data.meta.page} of {data.meta.totalPages} — {data.meta.total} total tasks
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === 1 || isPlaceholderData}
              onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.meta.page >= data.meta.totalPages || isPlaceholderData}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
