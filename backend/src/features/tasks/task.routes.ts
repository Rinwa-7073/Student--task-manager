import { Router } from 'express';
import { taskController } from '@features/tasks/task.controller';
import { validateRequest } from '@middleware/validateRequest';
import {
  createTaskSchema,
  logTimeSchema,
  taskIdParamSchema,
  taskQuerySchema,
  taskSubtaskParamSchema,
  updateTaskSchema,
} from '@features/tasks/task.validation';

const router = Router();

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: List tasks (paginated, filterable, searchable)
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: A paginated list of tasks
 */
router.get('/', validateRequest({ query: taskQuerySchema }), taskController.getAll);

/**
 * @openapi
 * /tasks/statistics:
 *   get:
 *     summary: Aggregate task statistics (counts by status/priority/category, overdue, focus time)
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Task statistics
 */
router.get('/statistics', taskController.getStatistics);

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task by id
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: The requested task
 *       404:
 *         description: Task not found
 */
router.get('/:id', validateRequest({ params: taskIdParamSchema }), taskController.getById);

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 *     responses:
 *       201:
 *         description: The created task
 */
router.post('/', validateRequest({ body: createTaskSchema }), taskController.create);

/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     summary: Replace a task (full update — all fields required)
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: The updated task
 *       404:
 *         description: Task not found
 */
router.put(
  '/:id',
  validateRequest({ params: taskIdParamSchema, body: createTaskSchema }),
  taskController.update,
);

/**
 * @openapi
 * /tasks/{id}:
 *   patch:
 *     summary: Partially update a task
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: The updated task
 *       404:
 *         description: Task not found
 */
router.patch(
  '/:id',
  validateRequest({ params: taskIdParamSchema, body: updateTaskSchema }),
  taskController.update,
);

/**
 * @openapi
 * /tasks/{id}/complete:
 *   patch:
 *     summary: Toggle a task's completion state (COMPLETED <-> TODO)
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: The updated task
 *       404:
 *         description: Task not found
 */
router.patch(
  '/:id/complete',
  validateRequest({ params: taskIdParamSchema }),
  taskController.markComplete,
);

/**
 * @openapi
 * /tasks/{id}/focus:
 *   patch:
 *     summary: Log focus time for a task (minutes)
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: The updated task with logged focus minutes
 */
router.patch(
  '/:id/focus',
  validateRequest({ params: taskIdParamSchema, body: logTimeSchema }),
  taskController.logFocusTime,
);

/**
 * @openapi
 * /tasks/{id}/subtasks/{subtaskId}/toggle:
 *   patch:
 *     summary: Toggle completion of a specific subtask
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: The updated task
 */
router.patch(
  '/:id/subtasks/:subtaskId/toggle',
  validateRequest({ params: taskSubtaskParamSchema }),
  taskController.toggleSubtask,
);

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     responses:
 *       204:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
router.delete('/:id', validateRequest({ params: taskIdParamSchema }), taskController.remove);

export { router as taskRoutes };
