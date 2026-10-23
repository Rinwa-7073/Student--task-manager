import { z } from 'zod';
import { TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES } from '@/types/task';

export const subtaskItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, 'Subtask title cannot be empty'),
  completed: z.boolean().default(false),
});

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Keep it under 200 characters'),
  description: z.string().trim().max(2000, 'Keep it under 2000 characters').optional(),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES),
  category: z.enum(TASK_CATEGORIES),
  dueDate: z.string().optional(),
  estimatedMinutes: z.coerce.number().int().positive().optional().or(z.literal('')),
  subtasks: z.array(subtaskItemSchema).optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const taskFormDefaults: TaskFormValues = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'TODO',
  category: 'OTHER',
  dueDate: '',
  estimatedMinutes: '',
  subtasks: [],
};
