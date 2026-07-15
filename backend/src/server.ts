import { createApp } from './app';
import { env } from '@config/env';
import { logger } from '@config/logger';
import { disconnectPrisma } from '@config/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
  logger.info(`📚 API docs available at http://localhost:${env.PORT}/api-docs`);
});

/**
 * Ensures in-flight requests finish and the database connection closes
 * cleanly before the process exits — important for container orchestrators
 * (Docker/Kubernetes) that send SIGTERM on redeploys.
 */
const gracefulShutdown = (signal: string): void => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await disconnectPrisma();
    logger.info('Server closed. Process exiting.');
    process.exit(0);
  });

  // Force-exit if shutdown hangs for too long.
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});
