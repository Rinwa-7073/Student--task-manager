import type { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { ApiError } from '@utils/ApiError';
import { taskService } from '@features/tasks/task.service';
import type { TaskQueryInput } from '@features/tasks/task.validation';

function requireUserId(req: Request): string {
  if (!req.user) throw new ApiError(401, 'Authentication required');
  return req.user.id;
}

export const taskController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const { items, meta } = await taskService.findMany(userId, req.query as unknown as TaskQueryInput);
    ApiResponse.ok(res, items, 'Tasks retrieved successfully', meta);
  }),

  getStatistics: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const stats = await taskService.getStatistics(userId);
    ApiResponse.ok(res, stats, 'Task statistics retrieved successfully');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const task = await taskService.findById(userId, req.params.id as string);
    ApiResponse.ok(res, task, 'Task retrieved successfully');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const task = await taskService.create(userId, req.body);
    ApiResponse.created(res, task, 'Task created successfully');
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const task = await taskService.update(userId, req.params.id as string, req.body);
    ApiResponse.ok(res, task, 'Task updated successfully');
  }),

  markComplete: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const task = await taskService.toggleComplete(userId, req.params.id as string);
    ApiResponse.ok(
      res,
      task,
      task.status === 'COMPLETED' ? 'Task marked complete' : 'Task marked incomplete',
    );
  }),

  logFocusTime: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const { minutes } = req.body;
    const task = await taskService.logFocusTime(userId, req.params.id as string, minutes);
    ApiResponse.ok(res, task, `Logged ${minutes} minutes of focus time`);
  }),

  toggleSubtask: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const task = await taskService.toggleSubtask(
      userId,
      req.params.id as string,
      req.params.subtaskId as string,
    );
    ApiResponse.ok(res, task, 'Subtask status toggled successfully');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    await taskService.delete(userId, req.params.id as string);
    ApiResponse.noContent(res);
  }),
};
