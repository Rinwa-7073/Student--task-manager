import { useQuery } from '@tanstack/react-query';
import { taskApi } from '@/features/tasks/api/taskApi';
import { taskKeys } from '@/features/tasks/api/taskKeys';
import type { TaskListParams } from '@/types/task';

/** Fetches a paginated, filterable list of tasks. */
export function useTasks(params: TaskListParams) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => taskApi.list(params),
    placeholderData: (previousData) => previousData,
  });
}

/** Fetches aggregate task statistics for the dashboard's stat cards. */
export function useTaskStatistics() {
  return useQuery({
    queryKey: taskKeys.statistics(),
    queryFn: () => taskApi.getStatistics(),
  });
}

/** Fetches a single task by id. */
export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? ''),
    queryFn: () => taskApi.getById(id as string),
    enabled: Boolean(id),
  });
}
