import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

interface RequestSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Validates `req.body` / `req.query` / `req.params` against Zod schemas
 * before the request reaches the controller. On success, `req.*` is
 * replaced with the *parsed* (and therefore typed + coerced) value.
 * On failure, a ZodError propagates to the centralized error handler.
 */
export const validateRequest =
  (schemas: RequestSchemas) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    if (schemas.params) req.params = schemas.params.parse(req.params);
    next();
  };
