import { hash } from 'bcryptjs';

import { prisma } from '@/shared/infra/database/prisma/client';

function assertSafeSeedEnvironment() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Seed bloqueado em NODE_ENV=production. Insira dados de produção manualmente pelo Supabase.',
    );
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL não definido para execução do seed.');
  }

  const { hostname, pathname } = new URL(databaseUrl);
  const databaseName = pathname.slice(1);
  const isLocalDatabase = ['localhost', '127.0.0.1', 'postgres'].includes(
    hostname,
  );
  const isTestDatabase = /(^|[_-])test($|[_-])/.test(databaseName);

  if (!isLocalDatabase && !isTestDatabase) {
    throw new Error(
      `Seed bloqueado para banco "${databaseName}" em "${hostname}". Use apenas banco local/teste.`,
    );
  }
}

async function main() {
  assertSafeSeedEnvironment();

  const passwordHash = await hash('123456', 10);

  // The default wallet and the 26 default expense categories are no longer
  // created here — a DB-level trigger (see
  // prisma/migrations/*_add_user_provisioning_trigger) provisions both
  // automatically as soon as the user row below is inserted. On a fresh
  // database this upsert's `create` branch is a real INSERT, so the trigger
  // fires and produces the same end state this file used to build by hand.
  await prisma.user.upsert({
    where: {
      email: 'admin@financecontrol.com',
    },
    update: {
      name: 'Admin Local',
      passwordHash,
    },
    create: {
      name: 'Admin Local',
      email: 'admin@financecontrol.com',
      passwordHash,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
