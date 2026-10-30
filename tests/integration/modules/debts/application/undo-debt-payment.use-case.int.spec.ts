import { UndoDebtPaymentUseCase } from '@/modules/debts/application/use-cases/undo-debt-payment.use-case';
import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { DebtNotPaidError } from '@/modules/debts/domain/errors/debt-not-paid.error';
import { NextOccurrenceAlreadyPaidError } from '@/modules/debts/domain/errors/next-occurrence-already-paid.error';
import { makePayDebtUseCase } from '@/modules/debts/infra/factories/make-pay-debt-use-case';
import { PrismaDebtRepository } from '@/modules/debts/infra/repositories/prisma-debt.repository';
import { PrismaDebtPaymentFinancialEffectAdapter } from '@/modules/debts/infra/services/prisma-debt-payment-financial-effect.adapter';
import { PrismaDebtPaymentWalletEffectAdapter } from '@/modules/debts/infra/services/prisma-debt-payment-wallet-effect.adapter';
import { prisma } from '@/shared/infra/database/prisma/client';
import { withTransaction } from '@/shared/infra/database/prisma/with-transaction';
import { PrismaTransactionClient } from '@/shared/infra/database/prisma/prisma-transaction-client';
import { createTestUser } from '../../../../helpers/database/create-test-user';
import { createTestWallet } from '../../../../helpers/database/create-test-wallet';
import { createTestExpenseCategory } from '../../../../helpers/database/create-test-expense-category';
import { createTestDebt } from '../../../../helpers/database/create-test-debt';

// Both undos must read the debt as PAID before either one writes, so the test
// exercises the real race instead of two undos that happen to run in turn.
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

// Pays the generated occurrence in another transaction right after the undo has
// read it as pending, like a second tab paying it at the same moment.
class OccurrencePaidMeanwhileRepository extends PrismaDebtRepository {
  constructor(
    client: PrismaTransactionClient,
    private readonly payOccurrence: (occurrenceId: string) => Promise<void>,
  ) {
    super(client);
  }

  async findGeneratedFrom(debtId: string, userId: string): Promise<Debt | null> {
    const occurrence = await super.findGeneratedFrom(debtId, userId);

    if (occurrence && !occurrence.isPaid()) {
      await this.payOccurrence(occurrence.id);
    }

    return occurrence;
  }
}

describe('UndoDebtPaymentUseCase Integration', () => {
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

  it('should credit the wallet only once when two undos read the paid debt at the same time', async () => {
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
    await makePayDebtUseCase().execute({
      id: debt.id,
      userId: user.id,
      paidAt: new Date('2026-10-20T00:00:00.000Z'),
      expenseCategoryId: category.id,
      paymentSource: DebtPaymentSource.BANK,
    });

    const waitForOthers = makeBarrier(2);
    const runUndo = () =>
      withTransaction((tx) =>
        new UndoDebtPaymentUseCase(
          new BarrierDebtRepository(tx, waitForOthers),
          new PrismaDebtPaymentFinancialEffectAdapter(tx),
          new PrismaDebtPaymentWalletEffectAdapter(tx),
        ).execute({ id: debt.id, userId: user.id }),
      );

    const results = await Promise.allSettled([runUndo(), runUndo()]);

    expect(results.map((result) => result.status).sort()).toEqual(['fulfilled', 'rejected']);
    const rejected = results.find((result) => result.status === 'rejected');
    expect((rejected as PromiseRejectedResult).reason).toBeInstanceOf(DebtNotPaidError);
    const updatedWallet = await prisma.wallet.findUnique({ where: { id: wallet.id } });
    expect(Number(updatedWallet?.bankBalance)).toBe(1000);
    const updatedDebt = await prisma.debt.findUnique({ where: { id: debt.id } });
    expect(updatedDebt?.status).toBe(DebtStatus.PENDING);
    expect(await prisma.transaction.count({ where: { debtId: debt.id } })).toBe(0);
  });

  it('should roll everything back when the next occurrence gets paid in the middle of the undo', async () => {
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
    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 100,
      type: DebtType.RECURRING,
    });
    const pay = (id: string) =>
      makePayDebtUseCase().execute({
        id,
        userId: user.id,
        paidAt: new Date('2026-10-20T00:00:00.000Z'),
        expenseCategoryId: category.id,
        paymentSource: DebtPaymentSource.BANK,
      });
    await pay(debt.id);
    const occurrence = await prisma.debt.findFirstOrThrow({
      where: { generatedFromDebtId: debt.id },
    });

    const undo = withTransaction((tx) =>
      new UndoDebtPaymentUseCase(
        new OccurrencePaidMeanwhileRepository(tx, async (id) => {
          await pay(id);
        }),
        new PrismaDebtPaymentFinancialEffectAdapter(tx),
        new PrismaDebtPaymentWalletEffectAdapter(tx),
      ).execute({ id: debt.id, userId: user.id }),
    );

    await expect(undo).rejects.toThrow(NextOccurrenceAlreadyPaidError);
    const debtRow = await prisma.debt.findUniqueOrThrow({ where: { id: debt.id } });
    expect(debtRow.status).toBe(DebtStatus.PAID);
    expect(debtRow.paymentRecordedAt).not.toBeNull();
    expect(await prisma.transaction.count({ where: { debtId: debt.id } })).toBe(1);
    expect(
      (await prisma.debt.findUniqueOrThrow({ where: { id: occurrence.id } })).status,
    ).toBe(DebtStatus.PAID);
    const updatedWallet = await prisma.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
    expect(Number(updatedWallet.bankBalance)).toBe(800);
  });
});
