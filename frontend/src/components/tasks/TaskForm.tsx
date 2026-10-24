import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { taskFormSchema, type TaskFormValues } from '@/features/tasks/taskFormSchema';
import { CATEGORY_LABEL, PRIORITY_LABEL, STATUS_LABEL } from '@/features/tasks/taskDisplay';
import { TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES } from '@/types/task';

interface TaskFormProps {
  defaultValues: TaskFormValues;
  onSubmit: (values: TaskFormValues) => void;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
}

export function TaskForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  onCancel,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema) as any,
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="e.g. Solve 5 Graph problems" {...register('title')} />
        {errors.title && (
          <p className="mt-1 text-xs text-[color:var(--color-danger-500)]">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Add context, links, or notes (optional)"
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-[color:var(--color-danger-500)]">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" {...register('category')}>
            {TASK_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABEL[category]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select id="priority" {...register('priority')}>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABEL[priority]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register('status')}>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="dueDate">Due date</Label>
          <Input id="dueDate" type="date" {...register('dueDate')} />
        </div>

        <div>
          <Label htmlFor="estimatedMinutes">Estimated Study Target (minutes)</Label>
          <Input
            id="estimatedMinutes"
            type="number"
            min="1"
            placeholder="e.g. 60"
            {...register('estimatedMinutes', { valueAsNumber: true })}
          />
          <p className="mt-1 text-[11px] text-secondary">Target focus duration for this task</p>
        </div>
      </div>

      <div className="flex justify-end gap-2.5 border-t border-default pt-5">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
