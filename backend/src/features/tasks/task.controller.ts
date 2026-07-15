import type { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { taskService } from '@features/tasks/task.service';
import type { TaskQueryInput } from '@features/tasks/task.validation';

/**
 * Thin HTTP adapter: parses/validated input already lives on `req`
 * (see task.validation.ts + validateRequest middleware), so controllers
 * are only responsible for calling the service and shaping the response.
 */
export const taskController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await taskService.findMany(req.query as unknown as TaskQueryInput);
    ApiResponse.ok(res, items, 'Tasks retrieved successfully', meta);
  }),

  getStatistics: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await taskService.getStatistics();
    ApiResponse.ok(res, stats, 'Task statistics retrieved successfully');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.findById(req.params.id as string);
    ApiResponse.ok(res, task, 'Task retrieved successfully');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.create(req.body);
    ApiResponse.created(res, task, 'Task created successfully');
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.update(req.params.id as string, req.body);
    ApiResponse.ok(res, task, 'Task updated successfully');
  }),

  markComplete: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.toggleComplete(req.params.id as string);
    ApiResponse.ok(res, task, task.status === 'COMPLETED' ? 'Task marked complete' : 'Task marked incomplete');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await taskService.delete(req.params.id as string);
    ApiResponse.noContent(res);
  }),
};
