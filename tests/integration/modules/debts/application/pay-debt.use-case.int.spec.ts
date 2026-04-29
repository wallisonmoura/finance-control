import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { makePayDebtUseCase } from '@/modules/debts/infra/factories/make-pay-debt-use-case';
import { InsufficientWalletBalanceError } from '@/modules/wallet/domain/errors/insufficient-wallet-balance.error';
import { prisma } from '@/shared/infra/database/prisma/client';
import { createTestExpenseCategory } from 'tests/helpers/database/create-test-expense-category';
import { createTestUser } from 'tests/helpers/database/create-test-user';
import { createTestWallet } from 'tests/helpers/database/create-test-wallet';
import { createTestDebt } from 'tests/helpers/database/make-test-debt-entity';

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

  it('deve pagar uma dívida, criar uma despesa real e debitar a Wallet em uma transação atômica', async () => {
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

  it('deve fazer rollback quando a Wallet não tiver saldo suficiente na origem escolhida', async () => {
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

  it('deve fazer rollback quando a categoria de despesa não pertencer ao usuário', async () => {
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
    ).rejects.toThrow('Expense category not found.');

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
});
