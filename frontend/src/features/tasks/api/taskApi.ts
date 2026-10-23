import { apiClient } from '@/api/apiClient';
import type { ApiSuccess } from '@/types/api';
import type {
  CreateTaskPayload,
  PaginationMeta,
  Task,
  TaskListParams,
  TaskStatistics,
  UpdateTaskPayload,
} from '@/types/task';

/**
 * Thin wrapper around the REST endpoints for the Task resource. Hooks
 * (see features/tasks/hooks) call these functions; components never
 * call axios directly.
 */
export const taskApi = {
  list: async (params: TaskListParams): Promise<{ items: Task[]; meta: PaginationMeta }> => {
    const { data } = await apiClient.get<ApiSuccess<Task[]>>('/tasks', { params });
    return { items: data.data, meta: data.meta as PaginationMeta };
  },

  getStatistics: async (): Promise<TaskStatistics> => {
    const { data } = await apiClient.get<ApiSuccess<TaskStatistics>>('/tasks/statistics');
    return data.data;
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await apiClient.get<ApiSuccess<Task>>(`/tasks/${id}`);
    return data.data;
  },

  create: async (payload: CreateTaskPayload): Promise<Task> => {
    const { data } = await apiClient.post<ApiSuccess<Task>>('/tasks', payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    const { data } = await apiClient.patch<ApiSuccess<Task>>(`/tasks/${id}`, payload);
    return data.data;
  },

  toggleComplete: async (id: string): Promise<Task> => {
    const { data } = await apiClient.patch<ApiSuccess<Task>>(`/tasks/${id}/complete`);
    return data.data;
  },

  logFocusTime: async (id: string, minutes: number): Promise<Task> => {
    const { data } = await apiClient.patch<ApiSuccess<Task>>(`/tasks/${id}/focus`, { minutes });
    return data.data;
  },

  toggleSubtask: async (id: string, subtaskId: string): Promise<Task> => {
    const { data } = await apiClient.patch<ApiSuccess<Task>>(
      `/tasks/${id}/subtasks/${subtaskId}/toggle`,
    );
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
