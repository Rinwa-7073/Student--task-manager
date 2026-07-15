import type { TaskCategory, TaskPriority, TaskStatus } from '@/types/task';

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const PRIORITY_BADGE_VARIANT: Record<TaskPriority, 'neutral' | 'signal' | 'danger'> = {
  LOW: 'neutral',
  MEDIUM: 'signal',
  HIGH: 'danger',
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};

export const STATUS_BADGE_VARIANT: Record<TaskStatus, 'neutral' | 'info' | 'success'> = {
  TODO: 'neutral',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
};

export const CATEGORY_LABEL: Record<TaskCategory, string> = {
  DSA: 'DSA',
  SQL: 'SQL',
  PROJECT: 'Project',
  APPLICATION: 'Application',
  INTERVIEW_PREP: 'Interview prep',
  OTHER: 'Other',
};

export function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return 'No due date';
  const date = new Date(dueDate);
  const today = new Date();
  const diffDays = Math.round((date.getTime() - today.setHours(0, 0, 0, 0)) / 86_400_000);

  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays === -1) return 'Due yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function isOverdue(dueDate: string | null, status: TaskStatus): boolean {
  if (!dueDate || status === 'COMPLETED') return false;
  return new Date(dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
}
