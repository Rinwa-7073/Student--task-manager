import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from '@config/env';
import { requestLogger } from '@middleware/requestLogger';
import { errorHandler } from '@middleware/errorHandler';
import { notFound } from '@middleware/notFound';
import { apiRoutes } from '@routes/index';
import { swaggerSpec } from '@docs/swagger';
import { ApiResponse } from '@utils/ApiResponse';

export const createApp = (): Express => {
  const app = express();

  // ---- Security & parsing middleware -------------------------------
  app.use(helmet());
  // CLIENT_ORIGIN may be a single URL or a comma-separated list (useful when
  // both a production domain and Vercel preview URLs need access).
  const allowedOrigins = env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin "${origin}" is not allowed`));
        }
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // ---- Health check (used by uptime monitors / container probes) ---
  app.get('/health', (_req, res) => {
    ApiResponse.ok(res, { uptime: process.uptime(), timestamp: new Date().toISOString() }, 'OK');
  });

  // ---- API documentation --------------------------------------------
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // ---- Versioned API routes ------------------------------------------
  app.use(env.API_PREFIX, apiRoutes);

  // ---- 404 + centralized error handling ------------------------------
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
