import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// The app talks to the database through Supabase's Supavisor pooler in
// transaction mode (DATABASE_POOLED_URL) — connections are held only for the
// duration of a single query, not the whole session, which is what makes it
// safe for many concurrent serverless invocations sharing a small connection
// budget. DATABASE_URL (session mode / direct) stays reserved for the
// Prisma CLI (migrations, via prisma.config.ts) and as the local dev/test
// fallback here, since local Postgres has no pooler and no such limit.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_POOLED_URL ?? process.env.DATABASE_URL!,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
