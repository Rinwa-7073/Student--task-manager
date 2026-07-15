import type { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps an async Express route handler so that any rejected promise is
 * forwarded to `next(err)` automatically. Without this, an unhandled
 * rejection inside a controller would crash the process instead of being
 * caught by the centralized error-handling middleware.
 *
 * Usage:
 *   router.get('/tasks', asyncHandler(taskController.getAll));
 */
export const asyncHandler =
  (handler: AsyncRouteHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
