import { z } from 'zod';
import { TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES } from '@features/tasks/task.types';

const dueDateSchema = z
  .string()
  .datetime({ message: 'dueDate must be a valid ISO 8601 date-time string' })
  .optional()
  .nullable();

export const subtaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, 'Subtask title is required').max(200),
  completed: z.boolean().default(false),
});

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer'),
  description: z.string().trim().max(2000).optional().nullable(),
  priority: z.enum(TASK_PRIORITIES).default('MEDIUM'),
  status: z.enum(TASK_STATUSES).default('TODO'),
  category: z.enum(TASK_CATEGORIES).default('OTHER'),
  dueDate: dueDateSchema,
  subtasks: z.array(subtaskSchema).optional().nullable(),
  loggedMinutes: z.number().int().nonnegative().optional().default(0),
  estimatedMinutes: z.number().int().positive().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskIdParamSchema = z.object({
  id: z.string().cuid('Invalid task id'),
});

export const taskSubtaskParamSchema = z.object({
  id: z.string().cuid('Invalid task id'),
  subtaskId: z.string().min(1, 'Subtask id is required'),
});

export const logTimeSchema = z.object({
  minutes: z.number().int().positive('Minutes must be at least 1'),
});

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  category: z.enum(TASK_CATEGORIES).optional(),
  search: z.string().trim().min(1).optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type LogTimeInput = z.infer<typeof logTimeSchema>;
