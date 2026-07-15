import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '@utils/ApiError';
import { logger } from '@config/logger';
import { isProduction } from '@config/env';

interface ErrorResponseBody {
  success: false;
  message: string;
  errors?: unknown;
  stack?: string;
}

/**
 * Translates known error types (Zod validation, Prisma, ApiError) into a
 * consistent HTTP response. Anything unrecognized is treated as a 500 and
 * its details are hidden from the client in production to avoid leaking
 * internals, while still being logged in full server-side.
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.flatten().fieldErrors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
    } else if (err.code === 'P2002') {
      statusCode = 409;
      message = 'A record with this value already exists';
      errors = err.meta;
    } else {
      statusCode = 400;
      message = 'Database request error';
    }
  } else if (err instanceof Error) {
    message = isProduction ? message : err.message;
  }

  logger.error(`${req.method} ${req.originalUrl} → ${statusCode}: ${message}`, {
    ...(err instanceof Error && !isProduction ? { stack: err.stack } : {}),
  });

  const body: ErrorResponseBody = { success: false, message };
  if (errors !== undefined) body.errors = errors;
  if (!isProduction && err instanceof Error) body.stack = err.stack;

  res.status(statusCode).json(body);
};
