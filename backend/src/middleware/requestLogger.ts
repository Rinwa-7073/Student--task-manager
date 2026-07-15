import morgan from 'morgan';
import { logger } from '@config/logger';
import { isDevelopment } from '@config/env';

/**
 * Streams morgan's HTTP access logs through Winston so every log line —
 * whether it comes from the app or from HTTP access logging — ends up in
 * one place with a consistent format and level.
 */
const stream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

export const requestLogger = morgan(isDevelopment ? 'dev' : 'combined', { stream });
