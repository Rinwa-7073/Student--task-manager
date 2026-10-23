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
  type Subtask,
  type TaskCategory,
  type TaskPriority,
  type TaskResponse,
  type TaskStatistics,
  type TaskStatus,
} from '@features/tasks/task.types';

function parseSubtasks(raw: string | null | undefined): Subtask[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item, idx) => ({
      id: typeof item.id === 'string' && item.id.length > 0 ? item.id : `subtask-${Date.now()}-${idx}`,
      title: typeof item.title === 'string' ? item.title : '',
      completed: Boolean(item.completed),
    }));
  } catch {
    return [];
  }
}

function stringifySubtasks(subtasks: { id?: string; title: string; completed?: boolean }[] | null | undefined): string | null {
  if (!subtasks || subtasks.length === 0) return null;
  const normalized: Subtask[] = subtasks.map((item, idx) => ({
    id: item.id && item.id.length > 0 ? item.id : `st-${Date.now()}-${idx}`,
    title: item.title,
    completed: Boolean(item.completed),
  }));
  return JSON.stringify(normalized);
}

function formatTask(task: any): TaskResponse {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority as TaskPriority,
    status: task.status as TaskStatus,
    category: task.category as TaskCategory,
    dueDate: task.dueDate,
    subtasks: parseSubtasks(task.subtasks),
    loggedMinutes: task.loggedMinutes ?? 0,
    estimatedMinutes: task.estimatedMinutes ?? null,
    userId: task.userId,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

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
      items: items.map(formatTask),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findById(userId: string, id: string): Promise<TaskResponse> {
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw ApiError.notFound(`Task with id "${id}" was not found`);
    return formatTask(task);
  }

  async create(userId: string, input: CreateTaskInput): Promise<TaskResponse> {
    const { subtasks, dueDate, ...rest } = input;
    const task = await prisma.task.create({
      data: {
        ...rest,
        userId,
        dueDate: dueDate ? new Date(dueDate) : null,
        subtasks: stringifySubtasks(subtasks),
        loggedMinutes: input.loggedMinutes ?? 0,
        estimatedMinutes: input.estimatedMinutes ?? null,
      },
    });
    return formatTask(task);
  }

  async update(userId: string, id: string, input: UpdateTaskInput): Promise<TaskResponse> {
    await this.findById(userId, id); // throws 404 if missing or not owned by this user

    const { subtasks, dueDate, ...rest } = input;
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...rest,
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(subtasks !== undefined && {
          subtasks: stringifySubtasks(subtasks),
        }),
      },
    });
    return formatTask(task);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.findById(userId, id); // throws 404 if missing or not owned by this user
    await prisma.task.delete({ where: { id } });
  }

  async toggleComplete(userId: string, id: string): Promise<TaskResponse> {
    const task = await this.findById(userId, id);
    const updated = await prisma.task.update({
      where: { id },
      data: { status: task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED' },
    });
    return formatTask(updated);
  }

  async logFocusTime(userId: string, id: string, minutes: number): Promise<TaskResponse> {
    const task = await this.findById(userId, id);
    const updated = await prisma.task.update({
      where: { id },
      data: {
        loggedMinutes: (task.loggedMinutes ?? 0) + minutes,
      },
    });
    return formatTask(updated);
  }

  async toggleSubtask(userId: string, id: string, subtaskId: string): Promise<TaskResponse> {
    const task = await this.findById(userId, id);
    const subtasks = [...task.subtasks];
    const target = subtasks.find((s) => s.id === subtaskId);
    if (!target) {
      throw ApiError.notFound(`Subtask with id "${subtaskId}" was not found`);
    }
    target.completed = !target.completed;

    const allCompleted = subtasks.length > 0 && subtasks.every((s) => s.completed);
    const updated = await prisma.task.update({
      where: { id },
      data: {
        subtasks: JSON.stringify(subtasks),
        ...(allCompleted && task.status !== 'COMPLETED' ? { status: 'COMPLETED' } : {}),
      },
    });
    return formatTask(updated);
  }

  async getStatistics(userId: string): Promise<TaskStatistics> {
    const where: Prisma.TaskWhereInput = { userId };

    const [total, statusGroups, priorityGroups, categoryGroups, overdue, allTasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.groupBy({ by: ['status'], where, _count: true }),
      prisma.task.groupBy({ by: ['priority'], where, _count: true }),
      prisma.task.groupBy({ by: ['category'], where, _count: true }),
      prisma.task.count({
        where: { ...where, dueDate: { lt: new Date() }, status: { not: 'COMPLETED' } },
      }),
      prisma.task.findMany({
        where,
        select: { loggedMinutes: true, subtasks: true },
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

    let totalLoggedMinutes = 0;
    let completedSubtasksCount = 0;
    let totalSubtasksCount = 0;

    for (const t of allTasks) {
      totalLoggedMinutes += t.loggedMinutes ?? 0;
      if (t.subtasks) {
        const subs = parseSubtasks(t.subtasks);
        totalSubtasksCount += subs.length;
        completedSubtasksCount += subs.filter((s) => s.completed).length;
      }
    }

    return {
      total,
      byStatus,
      byPriority,
      byCategory,
      overdue,
      totalLoggedMinutes,
      completedSubtasksCount,
      totalSubtasksCount,
    };
  }
}

export const taskService = new TaskService();
