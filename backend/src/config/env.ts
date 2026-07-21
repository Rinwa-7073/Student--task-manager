import 'dotenv/config';
import { z } from 'zod';

/**
 * Schema describing every environment variable the server depends on.
 * Validating at startup means a misconfigured deployment fails fast
 * with a readable error instead of crashing later on `undefined`.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be at least 16 characters long')
    .default('dev-only-insecure-secret-change-me-in-prod'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

if (isProduction && env.JWT_SECRET === 'dev-only-insecure-secret-change-me-in-prod') {
  // eslint-disable-next-line no-console
  console.error('❌ JWT_SECRET is still set to the development default. Set a real secret in production.');
  process.exit(1);
}