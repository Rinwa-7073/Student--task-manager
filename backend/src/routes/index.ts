import { Router } from 'express';
import { taskRoutes } from '@features/tasks/task.routes';

/**
 * Aggregates every feature's router under one place. Adding a new
 * feature (e.g. `notes`) means creating `features/notes/notes.routes.ts`
 * and registering it here — nothing else in the app needs to change.
 */
const router = Router();

router.use('/tasks', taskRoutes);

export { router as apiRoutes };
