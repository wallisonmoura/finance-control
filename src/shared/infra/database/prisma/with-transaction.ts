import { prisma } from './client';
import { PrismaTransactionClient } from './prisma-transaction-client';

/**
 * Runs `work` inside a single Prisma transaction, passing the transactional
 * client so repositories and adapters can be constructed scoped to it.
 *
 * Keeps the `$transaction` mechanism confined to shared infrastructure: use
 * cases orchestrate through ports and never see it, and factories that compose
 * a transactional operation depend on this seam instead of Prisma directly.
 */
export function withTransaction<T>(
  work: (tx: PrismaTransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction((tx) => work(tx));
}
