import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTask } from '@/features/tasks/hooks/useTasks';
import { useCreateTask, useUpdateTask } from '@/features/tasks/hooks/useTaskMutations';
import { taskFormDefaults, type TaskFormValues } from '@/features/tasks/taskFormSchema';
import type { CreateTaskPayload } from '@/types/task';

export function TaskFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: task, isLoading: isTaskLoading } = useTask(id);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const isSubmitting = createTask.isPending || updateTask.isPending;

  const handleSubmit = (values: TaskFormValues) => {
    const payload: CreateTaskPayload = {
      title: values.title,
      description: values.description || null,
      priority: values.priority,
      status: values.status,
      category: values.category,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      estimatedMinutes:
        typeof values.estimatedMinutes === 'number' && !isNaN(values.estimatedMinutes)
          ? values.estimatedMinutes
          : null,
      subtasks: values.subtasks
        ? values.subtasks.map((s, idx) => ({
            id: s.id && s.id.length > 0 ? s.id : `st-${Date.now()}-${idx}`,
            title: s.title,
            completed: Boolean(s.completed),
          }))
        : null,
    };

    if (isEditMode && id) {
      updateTask.mutate({ id, payload }, { onSuccess: () => navigate('/tasks') });
    } else {
      createTask.mutate(payload, { onSuccess: () => navigate('/tasks') });
    }
  };

  if (isEditMode && isTaskLoading) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  const defaultValues: TaskFormValues = task
    ? {
        title: task.title,
        description: task.description ?? '',
        priority: task.priority,
        status: task.status,
        category: task.category,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        estimatedMinutes: task.estimatedMinutes ?? '',
        subtasks: task.subtasks ?? [],
      }
    : taskFormDefaults;

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit task' : 'Create a task'}</CardTitle>
      </CardHeader>
      <CardContent>
        <TaskForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={isEditMode ? 'Save changes' : 'Create task'}
          onCancel={() => navigate('/tasks')}
        />
      </CardContent>
    </Card>
  );
}
