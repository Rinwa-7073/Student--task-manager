import type { TaskListParams } from '@/types/task';

/**
 * A query-key factory keeps cache keys consistent and typo-proof.
 * Any code that needs to invalidate "all task lists" or "one specific
 * task" imports from here instead of hand-writing array literals.
 */
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params: TaskListParams) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  statistics: () => [...taskKeys.all, 'statistics'] as const,
};
