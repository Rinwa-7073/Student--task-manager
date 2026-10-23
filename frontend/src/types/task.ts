export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_CATEGORIES = [
  'DSA',
  'SQL',
  'PROJECT',
  'APPLICATION',
  'INTERVIEW_PREP',
  'OTHER',
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  dueDate: string | null;
  subtasks?: Subtask[];
  loggedMinutes?: number;
  estimatedMinutes?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStatistics {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  byCategory: Record<TaskCategory, number>;
  overdue: number;
  totalLoggedMinutes?: number;
  completedSubtasksCount?: number;
  totalSubtasksCount?: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  dueDate?: string | null;
  subtasks?: Subtask[] | null;
  loggedMinutes?: number;
  estimatedMinutes?: number | null;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TaskListParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  search?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}
