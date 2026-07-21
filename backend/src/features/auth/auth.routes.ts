import { Router } from 'express';
import { authController } from '@features/auth/auth.controller';
import { validateRequest } from '@middleware/validateRequest';
import { authenticate } from '@middleware/authenticate';
import { loginSchema, registerSchema } from '@features/auth/auth.validation';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Create a new account
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: The created user and a JWT
 *       409:
 *         description: Email already registered
 */
router.post('/register', validateRequest({ body: registerSchema }), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: The user and a JWT
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateRequest({ body: loginSchema }), authController.login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The current user
 *       401:
 *         description: Missing or invalid token
 */
router.get('/me', authenticate, authController.me);

export { router as authRoutes };