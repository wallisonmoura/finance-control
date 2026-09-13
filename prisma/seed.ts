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

function daysFromToday(offset: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

async function categoryIdBySlug(userId: string, slug: string) {
  const category = await prisma.expenseCategory.findFirstOrThrow({
    where: { userId, slug },
  });

  return category.id;
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

  // Demo transactions/debts are wiped and recreated on every run — the seed
  // is meant to reset to a clean, presentable state on demand (e.g. before
  // capturing screenshots for the /about landing page), not accumulate data
  // across repeated `npm run db:seed:dev` runs.
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.debt.deleteMany({ where: { userId: user.id } });

  const wallet = await prisma.wallet.update({
    where: { userId: user.id },
    data: {
      bankBalance: 3200,
      cashBalance: 420,
      receivableBalance: 380,
    },
  });

  const [
    combustivelId,
    alimentacaoId,
    transporteId,
    energiaId,
    cartaoCreditoId,
    parcelasId,
  ] = await Promise.all([
    categoryIdBySlug(user.id, 'combustivel'),
    categoryIdBySlug(user.id, 'alimentacao'),
    categoryIdBySlug(user.id, 'transporte'),
    categoryIdBySlug(user.id, 'energia'),
    categoryIdBySlug(user.id, 'cartao-credito'),
    categoryIdBySlug(user.id, 'parcelas'),
  ]);

  // Regular income/expense history, spread across the last few months so
  // the /relatorios charts show real variation instead of a single spike.
  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
        amount: 2800,
        description: 'Salário',
        transactionDate: daysFromToday(-95),
      },
      {
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
        amount: 450,
        description: 'Freelance',
        transactionDate: daysFromToday(-70),
      },
      {
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
        amount: 2800,
        description: 'Salário',
        transactionDate: daysFromToday(-65),
      },
      {
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
        amount: 2800,
        description: 'Salário',
        transactionDate: daysFromToday(-35),
      },
      {
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
        amount: 2800,
        description: 'Salário',
        transactionDate: daysFromToday(-5),
      },
      {
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
        amount: 380,
        description: 'Freelance',
        transactionDate: daysFromToday(-2),
      },
      {
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        amount: 320,
        description: 'Combustível',
        expenseCategoryId: combustivelId,
        transactionDate: daysFromToday(-60),
      },
      {
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        amount: 480,
        description: 'Supermercado',
        expenseCategoryId: alimentacaoId,
        transactionDate: daysFromToday(-42),
      },
      {
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        amount: 90,
        description: 'Uber',
        expenseCategoryId: transporteId,
        transactionDate: daysFromToday(-30),
      },
      {
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        amount: 210,
        description: 'Conta de luz',
        expenseCategoryId: energiaId,
        transactionDate: daysFromToday(-20),
      },
      {
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        amount: 260,
        description: 'Combustível',
        expenseCategoryId: combustivelId,
        transactionDate: daysFromToday(-14),
      },
      {
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        amount: 390,
        description: 'Supermercado',
        expenseCategoryId: alimentacaoId,
        transactionDate: daysFromToday(-8),
      },
    ],
  });

  // Pending debts.
  await prisma.debt.createMany({
    data: [
      {
        userId: user.id,
        walletId: wallet.id,
        description: 'Internet',
        amount: 120,
        dueDate: daysFromToday(5),
        type: 'RECURRING',
        status: 'PENDING',
      },
      {
        userId: user.id,
        walletId: wallet.id,
        description: 'Seguro do carro',
        amount: 340,
        dueDate: daysFromToday(18),
        type: 'ONE_TIME',
        status: 'PENDING',
      },
    ],
  });

  // Paid debts — created together with the linked Transaction they would
  // have produced through the real PayDebtUseCase flow, so the Painel's
  // "Transações recentes" list looks exactly like a real payment.
  const paidDebts = [
    {
      description: 'Cartão de crédito',
      amount: 680,
      dueDate: daysFromToday(-3),
      paidAt: daysFromToday(-3),
      type: 'RECURRING' as const,
      expenseCategoryId: cartaoCreditoId,
    },
    {
      description: 'Financiamento da moto',
      amount: 420,
      dueDate: daysFromToday(-12),
      paidAt: daysFromToday(-12),
      type: 'INSTALLMENT' as const,
      notes: 'Parcela 05/24',
      expenseCategoryId: parcelasId,
    },
  ];

  for (const paidDebt of paidDebts) {
    const debt = await prisma.debt.create({
      data: {
        userId: user.id,
        walletId: wallet.id,
        description: paidDebt.description,
        amount: paidDebt.amount,
        dueDate: paidDebt.dueDate,
        type: paidDebt.type,
        status: 'PAID',
        paidAt: paidDebt.paidAt,
        paymentSource: 'BANK',
        notes: paidDebt.notes,
      },
    });

    await prisma.transaction.create({
      data: {
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        amount: paidDebt.amount,
        description: `Pagamento de dívida: ${paidDebt.description}`,
        expenseCategoryId: paidDebt.expenseCategoryId,
        transactionDate: paidDebt.paidAt,
        debtId: debt.id,
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
