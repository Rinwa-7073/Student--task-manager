import type { Prisma } from '@prisma/client';
import { prisma } from '@config/prisma';
import { ApiError } from '@utils/ApiError';
import type {
  CreateTaskInput,
  TaskQueryInput,
  UpdateTaskInput,
} from '@features/tasks/task.validation';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskCategory,
  type TaskPriority,
  type TaskStatistics,
  type TaskStatus,
} from '@features/tasks/task.types';

/**
 * Encapsulates every database interaction for the Task domain. Controllers
 * never talk to Prisma directly — they call into this service — so the
 * persistence layer can be mocked in tests or swapped out without
 * touching HTTP concerns.
 *
 * Every method takes `userId` and scopes its query to it. This is the
 * entire mechanism behind "tasks are private to the account that created
 * them" — there's no separate authorization layer to keep in sync; a task
 * that isn't yours simply doesn't match `where: { userId }` and looks
 * exactly like a 404, which is also the correct thing to reveal to an
 * attacker probing for other users' task ids.
 */
class TaskService {
  async findMany(userId: string, query: TaskQueryInput) {
    const { page, limit, status, priority, category, search, sortBy, sortOrder } = query;

    const where: Prisma.TaskWhereInput = {
      userId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(category && { category }),
      ...(search && {
        OR: [{ title: { contains: search } }, { description: { contains: search } }],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findById(userId: string, id: string) {
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw ApiError.notFound(`Task with id "${id}" was not found`);
    return task;
  }

  async create(userId: string, input: CreateTaskInput) {
    return prisma.task.create({
      data: {
        ...input,
        userId,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      },
    });
  }

  async update(userId: string, id: string, input: UpdateTaskInput) {
    await this.findById(userId, id); // throws 404 if missing or not owned by this user

    return prisma.task.update({
      where: { id },
      data: {
        ...input,
        ...(input.dueDate !== undefined && {
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        }),
      },
    });
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.findById(userId, id); // throws 404 if missing or not owned by this user
    await prisma.task.delete({ where: { id } });
  }

  /**
   * Toggles a task's completion state: COMPLETED -> TODO, anything else -> COMPLETED.
   * Exposed as its own endpoint (PATCH /tasks/:id/complete) because "mark
   * complete" is the single most common action a user takes on a task —
   * it deserves a one-click affordance instead of a full edit form.
   */
  async toggleComplete(userId: string, id: string) {
    const task = await this.findById(userId, id);
    return prisma.task.update({
      where: { id },
      data: { status: task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED' },
    });
  }

  async getStatistics(userId: string): Promise<TaskStatistics> {
    const where: Prisma.TaskWhereInput = { userId };

    const [total, statusGroups, priorityGroups, categoryGroups, overdue] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.groupBy({ by: ['status'], where, _count: true }),
      prisma.task.groupBy({ by: ['priority'], where, _count: true }),
      prisma.task.groupBy({ by: ['category'], where, _count: true }),
      prisma.task.count({
        where: { ...where, dueDate: { lt: new Date() }, status: { not: 'COMPLETED' } },
      }),
    ]);

    const byStatus = TASK_STATUSES.reduce(
      (acc, key) => ({ ...acc, [key]: 0 }),
      {} as Record<TaskStatus, number>,
    );
    const byPriority = TASK_PRIORITIES.reduce(
      (acc, key) => ({ ...acc, [key]: 0 }),
      {} as Record<TaskPriority, number>,
    );
    const byCategory = TASK_CATEGORIES.reduce(
      (acc, key) => ({ ...acc, [key]: 0 }),
      {} as Record<TaskCategory, number>,
    );

    statusGroups.forEach((g: { status: string; _count: number }) => {
      byStatus[g.status as TaskStatus] = g._count;
    });
    priorityGroups.forEach((g: { priority: string; _count: number }) => {
      byPriority[g.priority as TaskPriority] = g._count;
    });
    categoryGroups.forEach((g: { category: string; _count: number }) => {
      byCategory[g.category as TaskCategory] = g._count;
    });

    return { total, byStatus, byPriority, byCategory, overdue };
  }
}

export const taskService = new TaskService();