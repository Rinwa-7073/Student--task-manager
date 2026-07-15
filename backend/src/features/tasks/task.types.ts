/**
 * Canonical value sets for Task fields that SQLite (via Prisma) stores as
 * plain strings. Defining them once here — and validating against them
 * with Zod in task.validation.ts — keeps the "enum" concept enforced at
 * the application boundary even though the database itself doesn't have
 * native enum support.
 */
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

export interface TaskStatistics {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  byCategory: Record<TaskCategory, number>;
  overdue: number;
}
