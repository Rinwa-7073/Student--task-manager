import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { env, isDevelopment } from '@config/env';
import { logger } from '@config/logger';

/**
 * Prisma Client singleton.
 *
 * We use the SQLite driver adapter (`@prisma/adapter-better-sqlite3`)
 * together with Prisma's Rust-free query compiler (`engineType = "client"`
 * in schema.prisma). This means:
 *   - No native query-engine binary is downloaded or shipped.
 *   - Prisma runs as pure TypeScript/WASM, which is faster to boot and
 *     trivially portable across CI, containers, and serverless targets.
 *
 * The singleton pattern below prevents creating a new PrismaClient (and
 * therefore a new connection pool) on every hot-reload in development.
 */
const adapter = new PrismaBetterSqlite3({
  url: env.DATABASE_URL.replace(/^file:/, ''),
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: isDevelopment
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'warn' },
          { emit: 'event', level: 'error' },
        ]
      : [{ emit: 'event', level: 'error' }],
  });

if (isDevelopment) {
  globalForPrisma.prisma = prisma;

  // @ts-expect-error -- Prisma's event typings are generic; this is safe at runtime.
  prisma.$on('query', (event: { query: string; duration: number }) => {
    logger.debug(`Prisma query (${event.duration}ms): ${event.query}`);
  });
}

// @ts-expect-error -- see above
prisma.$on('error', (event: { message: string }) => {
  logger.error(`Prisma error: ${event.message}`);
});

/** Gracefully closes the database connection. Called on process shutdown. */
export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
};
