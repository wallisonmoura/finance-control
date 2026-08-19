import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Migrations need a session-mode/direct connection, not the
    // transaction-mode pooler DATABASE_URL points the app's runtime client
    // at — see src/shared/infra/database/prisma/client.ts. Falls back to
    // DATABASE_URL locally, where there's no pooler and no DIRECT_URL set.
    url: process.env['DIRECT_URL'] ?? process.env['DATABASE_URL'],
  },
});
