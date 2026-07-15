import winston from 'winston';
import { env, isProduction } from '@config/env';

/**
 * Centralized Winston logger.
 *
 * - In development: colorized, human-readable console output.
 * - In production: structured JSON, suitable for log aggregators
 *   (e.g. CloudWatch, Datadog, ELK).
 */
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  }),
);

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: isProduction ? productionFormat : developmentFormat,
  transports: [new winston.transports.Console()],
  exitOnError: false,
});
