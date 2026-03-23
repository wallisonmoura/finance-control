import { hash } from 'bcryptjs';

import { prisma } from '@/shared/infra/database/prisma/client';

async function main() {
  const passwordHash = await hash('123456', 10);

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
