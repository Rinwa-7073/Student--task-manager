import { Router } from 'express';
import { taskRoutes } from '@features/tasks/task.routes';
import { authRoutes } from '@features/auth/auth.routes';
import { authenticate } from '@middleware/authenticate';

/**
 * Aggregates every feature's router under one place. Adding a new
 * feature (e.g. `notes`) means creating `features/notes/notes.routes.ts`
 * and registering it here — nothing else in the app needs to change.
 *
 * `/auth` is public (register/login must be reachable without a token;
 * `/auth/me` protects itself internally). Every `/tasks` route requires a
 * valid JWT, enforced once here rather than on each individual route.
 */
const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', authenticate, taskRoutes);

export { router as apiRoutes };