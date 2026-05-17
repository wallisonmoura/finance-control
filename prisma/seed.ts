import { hash } from 'bcryptjs';

import { prisma } from '@/shared/infra/database/prisma/client';

async function main() {
  const passwordHash = await hash('123456', 10);

  const user = await prisma.user.upsert({
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

  const existingDefaultWallet = await prisma.wallet.findFirst({
    where: {
      userId: user.id,
      isDefault: true,
    },
  });

  if (!existingDefaultWallet) {
    await prisma.wallet.create({
      data: {
        userId: user.id,
        name: 'Carteira Principal',
        isDefault: true,
        bankBalance: 0,
        cashBalance: 0,
        receivableBalance: 0,
      },
    });
  }

  const categories = [
    {
      name: 'Combustível',
      slug: 'combustivel',
    },
    {
      name: 'Alimentação',
      slug: 'alimentacao',
    },
    {
      name: 'Manutenção',
      slug: 'manutencao',
    },
    {
      name: 'Transporte',
      slug: 'transporte',
    },
    {
      name: 'Moradia / Aluguel',
      slug: 'moradia-aluguel',
    },
    {
      name: 'Energia',
      slug: 'energia',
    },
    {
      name: 'Água',
      slug: 'agua',
    },
    {
      name: 'Internet / Telefone',
      slug: 'internet-telefone',
    },
    {
      name: 'Compras / Insumos',
      slug: 'compras-insumos',
    },
    {
      name: 'Taxas / Impostos',
      slug: 'taxas-impostos',
    },
    {
      name: 'Equipamentos',
      slug: 'equipamentos',
    },
    {
      name: 'Marketing',
      slug: 'marketing',
    },
    {
      name: 'Saúde',
      slug: 'saude',
    },
    {
      name: 'Parcelas',
      slug: 'parcelas',
    },
    {
      name: 'Outros',
      slug: 'outros',
    },
  ];

  for (const category of categories) {
    await prisma.expenseCategory.upsert({
      where: {
        userId_slug: {
          userId: user.id,
          slug: category.slug,
        },
      },
      update: {
        name: category.name,
        isActive: true,
      },
      create: {
        userId: user.id,
        name: category.name,
        slug: category.slug,
        isActive: true,
      },
    });
  }
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
