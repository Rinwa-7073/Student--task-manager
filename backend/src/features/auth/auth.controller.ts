import type { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';
import { ApiError } from '@utils/ApiError';
import { authService } from '@features/auth/auth.service';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    ApiResponse.created(res, result, 'Account created successfully');
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    ApiResponse.ok(res, result, 'Logged in successfully');
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError(401, 'Not authenticated');
    const user = await authService.getById(req.user.id);
    ApiResponse.ok(res, user, 'Current user retrieved successfully');
  }),
};