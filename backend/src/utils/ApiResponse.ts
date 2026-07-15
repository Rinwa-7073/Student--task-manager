import type { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SuccessPayload<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

/**
 * Ensures every successful API response shares the same envelope shape:
 *
 * ```json
 * { "success": true, "message": "...", "data": ..., "meta": { ... } }
 * ```
 *
 * Keeping this in one place means the frontend can rely on a single,
 * predictable contract regardless of which endpoint it calls.
 */
export class ApiResponse {
  static send<T>(
    res: Response,
    statusCode: number,
    message: string,
    data: T,
    meta?: PaginationMeta,
  ): Response<SuccessPayload<T>> {
    const payload: SuccessPayload<T> = { success: true, message, data };
    if (meta) payload.meta = meta;
    return res.status(statusCode).json(payload);
  }

  static ok<T>(res: Response, data: T, message = 'Success', meta?: PaginationMeta): Response {
    return this.send(res, 200, message, data, meta);
  }

  static created<T>(res: Response, data: T, message = 'Resource created'): Response {
    return this.send(res, 201, message, data);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
