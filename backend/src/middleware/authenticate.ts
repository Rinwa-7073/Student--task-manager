import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '@utils/ApiError';
import { verifyToken } from '@utils/jwt';

/**
 * Verifies the `Authorization: Bearer <token>` header on protected routes
 * and attaches the decoded payload to `req.user`. Any downstream handler
 * (or service call, via `req.user.id`) can then trust that the request
 * belongs to a real, authenticated user.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required — missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length);

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }
};