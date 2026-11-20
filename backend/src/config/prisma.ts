import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Single shared Prisma client instance across the app (recommended pattern).
export const prisma = new PrismaClient({
  log: env.isProduction ? ['error', 'warn'] : ['error', 'warn'],
});
