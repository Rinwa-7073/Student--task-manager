import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/features/tasks/api/taskApi';
import { taskKeys } from '@/features/tasks/api/taskKeys';
import { useToast } from '@/providers/ToastProvider';
import { ApiRequestError } from '@/api/apiClient';
import type { CreateTaskPayload, PaginationMeta, Task, UpdateTaskPayload } from '@/types/task';

function errorMessage(error: unknown): string {
  return error instanceof ApiRequestError
    ? error.message
    : 'Something went wrong. Please try again.';
}

type TaskListCache = { items: Task[]; meta: PaginationMeta };

/** Creates a task, then invalidates task lists and statistics so the UI reflects it immediately. */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.statistics() });
      toast({ title: 'Task created', variant: 'success' });
    },
    onError: (error) => {
      toast({ title: 'Could not create task', description: errorMessage(error), variant: 'error' });
    },
  });
}

/** Updates a task, then invalidates the affected list, detail, and statistics caches. */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      taskApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.statistics() });
      toast({ title: 'Task updated', variant: 'success' });
    },
    onError: (error) => {
      toast({ title: 'Could not update task', description: errorMessage(error), variant: 'error' });
    },
  });
}

/**
 * Deletes a task with an optimistic update: the row disappears from every
 * cached list instantly, and is restored automatically if the request
 * fails. This is what makes bulk-cleaning a task list feel instant instead
 * of waiting on a network round trip per row.
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => taskApi.remove(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previousLists = queryClient.getQueriesData<TaskListCache>({ queryKey: taskKeys.lists() });

      previousLists.forEach(([queryKey, data]) => {
        if (!data) return;
        queryClient.setQueryData<TaskListCache>(queryKey, {
          items: data.items.filter((task) => task.id !== id),
          meta: { ...data.meta, total: Math.max(0, data.meta.total - 1) },
        });
      });

      return { previousLists };
    },
    onError: (error, _id, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast({ title: 'Could not delete task', description: errorMessage(error), variant: 'error' });
    },
    onSuccess: () => {
      toast({ title: 'Task deleted', variant: 'success' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.statistics() });
    },
  });
}

/**
 * Toggles a task's completion state optimistically — the checkbox flips
 * and the badge updates immediately, then reconciles with the server
 * response (or rolls back on failure).
 */
export function useToggleComplete() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => taskApi.toggleComplete(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previousLists = queryClient.getQueriesData<TaskListCache>({ queryKey: taskKeys.lists() });

      previousLists.forEach(([queryKey, data]) => {
        if (!data) return;
        queryClient.setQueryData<TaskListCache>(queryKey, {
          ...data,
          items: data.items.map((task) =>
            task.id === id
              ? { ...task, status: task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED' }
              : task,
          ),
        });
      });

      return { previousLists };
    },
    onError: (error, _id, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast({ title: 'Could not update task', description: errorMessage(error), variant: 'error' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.statistics() });
    },
  });
}

/**
 * Logs study focus time (in minutes) for a task, updating cached task lists,
 * task detail views, and aggregate study statistics.
 */
export function useLogFocusTime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) =>
      taskApi.logFocusTime(id, minutes),
    onSuccess: (updatedTask, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.statistics() });
      toast({
        title: 'Focus session recorded!',
        description: `Logged ${variables.minutes}m focus time for "${updatedTask.title}".`,
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Could not log focus time',
        description: errorMessage(error),
        variant: 'error',
      });
    },
  });
}

