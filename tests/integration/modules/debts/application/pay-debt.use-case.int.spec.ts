import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { makePayDebtUseCase } from '@/modules/debts/infra/factories/make-pay-debt-use-case';
import { InsufficientWalletBalanceError } from '@/modules/wallet/domain/errors/insufficient-wallet-balance.error';
import { prisma } from '@/shared/infra/database/prisma/client';
import { createTestUser } from '../../../../helpers/database/create-test-user';
import { createTestWallet } from '../../../../helpers/database/create-test-wallet';
import { createTestExpenseCategory } from '../../../../helpers/database/create-test-expense-category';
import { createTestDebt } from '../../../../helpers/database/create-test-debt';
import { PayDebtUseCase } from '@/modules/debts/application/use-cases/pay-debt.use-case';
import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtAlreadyPaidError } from '@/modules/debts/domain/errors/debt-already-paid.error';
import { PrismaDebtRepository } from '@/modules/debts/infra/repositories/prisma-debt.repository';
import { PrismaDebtPaymentFinancialEffectAdapter } from '@/modules/debts/infra/services/prisma-debt-payment-financial-effect.adapter';
import { PrismaDebtPaymentWalletEffectAdapter } from '@/modules/debts/infra/services/prisma-debt-payment-wallet-effect.adapter';
import { withTransaction } from '@/shared/infra/database/prisma/with-transaction';
import { PrismaTransactionClient } from '@/shared/infra/database/prisma/prisma-transaction-client';

// Both payments must read the debt as PENDING before either one writes, so the
// test exercises the real race instead of two payments that happen to run in turn.
function makeBarrier(parties: number) {
  let arrived = 0;
  let release!: () => void;
  const allArrived = new Promise<void>((resolve) => {
    release = resolve;
  });

  return async () => {
    arrived += 1;

    if (arrived === parties) {
      release();
    }

    await allArrived;
  };
}

class BarrierDebtRepository extends PrismaDebtRepository {
  constructor(
    client: PrismaTransactionClient,
    private readonly waitForOthers: () => Promise<void>,
  ) {
    super(client);
  }

  async findById(id: string): Promise<Debt | null> {
    const debt = await super.findById(id);
    await this.waitForOthers();
    return debt;
  }
}

describe('PayDebtUseCase Integration', () => {
  beforeEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.debt.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.debt.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should pay a debt, create a real expense, and debit the Wallet in an atomic transaction', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 500,
      cashBalance: 100,
      receivableBalance: 200,
    });

    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Parcelas',
      slug: 'parcelas',
    });

    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Aluguel',
      amount: 500,
      status: DebtStatus.PENDING,
      dueDate: new Date('2026-05-15T00:00:00.000Z'),
    });

    const useCase = makePayDebtUseCase();

    const output = await useCase.execute({
      id: debt.id,
      userId: user.id,
      paidAt: new Date('2026-05-10T00:00:00.000Z'),
      expenseCategoryId: category.id,
      paymentSource: DebtPaymentSource.BANK,
    });

    expect(output.id).toBe(debt.id);
    expect(output.status).toBe(DebtStatus.PAID);
    expect(output.paymentSource).toBe(DebtPaymentSource.BANK);
    expect(output.paidAt?.toISOString()).toBe('2026-05-10T00:00:00.000Z');

    const persistedDebt = await prisma.debt.findUnique({
      where: {
        id: debt.id,
      },
    });

    expect(persistedDebt?.status).toBe(DebtStatus.PAID);
    expect(persistedDebt?.paymentSource).toBe(DebtPaymentSource.BANK);
    expect(persistedDebt?.paidAt?.toISOString()).toBe(
      '2026-05-10T00:00:00.000Z',
    );

    const transaction = await prisma.transaction.findUnique({
      where: {
        debtId: debt.id,
      },
    });

    expect(transaction).not.toBeNull();
    expect(transaction?.userId).toBe(user.id);
    expect(transaction?.walletId).toBe(wallet.id);
    expect(transaction?.amount.toNumber()).toBe(500);
    expect(transaction?.description).toBe('Pagamento de dívida: Aluguel');
    expect(transaction?.expenseCategoryId).toBe(category.id);
    expect(transaction?.debtId).toBe(debt.id);

    const updatedWallet = await prisma.wallet.findUnique({
      where: {
        id: wallet.id,
      },
    });

    expect(updatedWallet?.bankBalance.toNumber()).toBe(0);
    expect(updatedWallet?.cashBalance.toNumber()).toBe(100);
    expect(updatedWallet?.receivableBalance.toNumber()).toBe(200);
  });

  it('should persist the next pending occurrence when paying a RECURRING debt', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 500,
      cashBalance: 100,
      receivableBalance: 200,
    });

    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Moradia',
      slug: 'moradia',
    });

    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Aluguel',
      amount: 500,
      status: DebtStatus.PENDING,
      type: DebtType.RECURRING,
      dueDate: new Date('2026-01-31T00:00:00.000Z'),
    });

    const useCase = makePayDebtUseCase();

    await useCase.execute({
      id: debt.id,
      userId: user.id,
      paidAt: new Date('2026-01-28T00:00:00.000Z'),
      expenseCategoryId: category.id,
      paymentSource: DebtPaymentSource.BANK,
    });

    const debtsOnDatabase = await prisma.debt.findMany({
      where: { userId: user.id },
    });

    expect(debtsOnDatabase).toHaveLength(2);

    const nextOccurrence = debtsOnDatabase.find((item) => item.id !== debt.id);

    expect(nextOccurrence).toBeDefined();
    expect(nextOccurrence?.status).toBe(DebtStatus.PENDING);
    expect(nextOccurrence?.type).toBe(DebtType.RECURRING);
    expect(nextOccurrence?.description).toBe('Aluguel');
    expect(nextOccurrence?.amount.toNumber()).toBe(500);
    expect(nextOccurrence?.dueDate.toISOString().slice(0, 10)).toBe(
      '2026-02-28',
    );
    expect(nextOccurrence?.paidAt).toBeNull();
    expect(nextOccurrence?.paymentSource).toBeNull();
    expect(nextOccurrence?.generatedFromDebtId).toBe(debt.id);

    const paidDebt = debtsOnDatabase.find((item) => item.id === debt.id);

    expect(paidDebt?.paymentRecordedAt).toBeInstanceOf(Date);
  });

  it('should roll back when the Wallet has insufficient balance in the chosen source', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 300,
      cashBalance: 100,
      receivableBalance: 200,
    });

    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Parcelas',
      slug: 'parcelas',
    });

    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Aluguel',
      amount: 500,
      status: DebtStatus.PENDING,
      dueDate: new Date('2026-05-15T00:00:00.000Z'),
    });

    const useCase = makePayDebtUseCase();

    await expect(
      useCase.execute({
        id: debt.id,
        userId: user.id,
        paidAt: new Date('2026-05-10T00:00:00.000Z'),
        expenseCategoryId: category.id,
        paymentSource: DebtPaymentSource.BANK,
      }),
    ).rejects.toBeInstanceOf(InsufficientWalletBalanceError);

    const persistedDebt = await prisma.debt.findUnique({
      where: {
        id: debt.id,
      },
    });

    expect(persistedDebt?.status).toBe(DebtStatus.PENDING);
    expect(persistedDebt?.paidAt).toBeNull();
    expect(persistedDebt?.paymentSource).toBeNull();

    const transaction = await prisma.transaction.findUnique({
      where: {
        debtId: debt.id,
      },
    });

    expect(transaction).toBeNull();

    const persistedWallet = await prisma.wallet.findUnique({
      where: {
        id: wallet.id,
      },
    });

    expect(persistedWallet?.bankBalance.toNumber()).toBe(300);
    expect(persistedWallet?.cashBalance.toNumber()).toBe(100);
    expect(persistedWallet?.receivableBalance.toNumber()).toBe(200);
  });

  it('should roll back when the expense category does not belong to the user', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 500,
      cashBalance: 100,
      receivableBalance: 200,
    });

    const anotherUser = await createTestUser();

    const anotherCategory = await createTestExpenseCategory({
      userId: anotherUser.id,
      name: 'Categoria de outro usuário',
      slug: 'categoria-outro-usuario',
    });

    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      description: 'Aluguel',
      amount: 500,
      status: DebtStatus.PENDING,
      dueDate: new Date('2026-05-15T00:00:00.000Z'),
    });

    const useCase = makePayDebtUseCase();

    await expect(
      useCase.execute({
        id: debt.id,
        userId: user.id,
        paidAt: new Date('2026-05-10T00:00:00.000Z'),
        expenseCategoryId: anotherCategory.id,
        paymentSource: DebtPaymentSource.BANK,
      }),
    ).rejects.toThrow('Categoria de despesa não encontrada.');

    const persistedDebt = await prisma.debt.findUnique({
      where: {
        id: debt.id,
      },
    });

    expect(persistedDebt?.status).toBe(DebtStatus.PENDING);
    expect(persistedDebt?.paidAt).toBeNull();
    expect(persistedDebt?.paymentSource).toBeNull();

    const transaction = await prisma.transaction.findUnique({
      where: {
        debtId: debt.id,
      },
    });

    expect(transaction).toBeNull();

    const persistedWallet = await prisma.wallet.findUnique({
      where: {
        id: wallet.id,
      },
    });

    expect(persistedWallet?.bankBalance.toNumber()).toBe(500);
    expect(persistedWallet?.cashBalance.toNumber()).toBe(100);
    expect(persistedWallet?.receivableBalance.toNumber()).toBe(200);
  });

  it('should pay only once when two payments read the pending debt at the same time', async () => {
    const user = await createTestUser();
    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 1000,
      cashBalance: 0,
      receivableBalance: 0,
    });
    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Contas',
      slug: 'contas',
    });
    const debt = await createTestDebt({ userId: user.id, walletId: wallet.id, amount: 300 });

    const waitForOthers = makeBarrier(2);
    const runPayment = () =>
      withTransaction((tx) =>
        new PayDebtUseCase(
          new BarrierDebtRepository(tx, waitForOthers),
          new PrismaDebtPaymentFinancialEffectAdapter(tx),
          new PrismaDebtPaymentWalletEffectAdapter(tx),
        ).execute({
          id: debt.id,
          userId: user.id,
          paidAt: new Date('2026-10-20T00:00:00.000Z'),
          expenseCategoryId: category.id,
          paymentSource: DebtPaymentSource.BANK,
        }),
      );

    const results = await Promise.allSettled([runPayment(), runPayment()]);

    expect(results.map((result) => result.status).sort()).toEqual(['fulfilled', 'rejected']);
    const rejected = results.find((result) => result.status === 'rejected');
    expect((rejected as PromiseRejectedResult).reason).toBeInstanceOf(DebtAlreadyPaidError);
    const updatedWallet = await prisma.wallet.findUnique({ where: { id: wallet.id } });
    expect(Number(updatedWallet?.bankBalance)).toBe(700);
    expect(await prisma.transaction.count({ where: { debtId: debt.id } })).toBe(1);
    const updatedDebt = await prisma.debt.findUnique({ where: { id: debt.id } });
    expect(updatedDebt?.status).toBe(DebtStatus.PAID);
  });
});
