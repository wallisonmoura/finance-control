import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// The app talks to the database through Supabase's Supavisor pooler in
// transaction mode (DATABASE_URL) — connections are held only for the
// duration of a single query, not the whole session, which is what makes it
// safe for many concurrent serverless invocations sharing a small connection
// budget. This matches Prisma's and Supabase's documented convention for
// serverless deployments: DATABASE_URL is the pooled runtime connection,
// DIRECT_URL (used only by prisma.config.ts, for the CLI/migrations) is the
// session-mode/direct one. Locally there's no pooler, so DATABASE_URL alone
// (pointing at Docker Postgres) covers both.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
