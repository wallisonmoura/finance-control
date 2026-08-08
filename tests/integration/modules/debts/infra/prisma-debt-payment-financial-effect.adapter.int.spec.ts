import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { PrismaDebtPaymentFinancialEffectAdapter } from '@/modules/debts/infra/services/prisma-debt-payment-financial-effect.adapter';
import { prisma } from '@/shared/infra/database/prisma/client';
import { DefaultWalletNotFoundError } from '@/shared/infra/errors/default-wallet-not-found.error';
import { TransactionType } from '@prisma/client';
import { createTestUser } from '../../../../helpers/database/create-test-user';
import { createTestWallet } from '../../../../helpers/database/create-test-wallet';
import { createTestExpenseCategory } from '../../../../helpers/database/create-test-expense-category';
import { createTestDebt } from '../../../../helpers/database/create-test-debt';

describe('PrismaDebtPaymentFinancialEffectAdapter', () => {
  let adapter: PrismaDebtPaymentFinancialEffectAdapter;

  beforeAll(async () => {
    adapter = new PrismaDebtPaymentFinancialEffectAdapter();
  });

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

  it('should create a real expense linked to the paid debt', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
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
      status: DebtStatus.PAID,
      dueDate: new Date('2026-05-15T00:00:00.000Z'),
    });

    await adapter.registerPayment({
      debtId: debt.id,
      userId: user.id,
      amount: 500,
      description: 'Aluguel',
      paidAt: new Date('2026-05-10T00:00:00.000Z'),
      expenseCategoryId: category.id,
    });

    const transaction = await prisma.transaction.findUnique({
      where: {
        debtId: debt.id,
      },
    });

    expect(transaction).not.toBeNull();
    expect(transaction?.userId).toBe(user.id);
    expect(transaction?.walletId).toBe(wallet.id);
    expect(transaction?.type).toBe(TransactionType.EXPENSE);
    expect(transaction?.amount.toNumber()).toBe(500);
    expect(transaction?.description).toBe('Pagamento de dívida: Aluguel');
    expect(transaction?.transactionDate.toISOString()).toBe(
      '2026-05-10T00:00:00.000Z',
    );
    expect(transaction?.expenseCategoryId).toBe(category.id);
    expect(transaction?.debtId).toBe(debt.id);
  });

  it('should throw an error when there is no default wallet for the user', async () => {
    const user = await createTestUser();

    const category = await createTestExpenseCategory({
      userId: user.id,
    });

    await expect(
      adapter.registerPayment({
        debtId: crypto.randomUUID(),
        userId: user.id,
        amount: 500,
        description: 'Aluguel',
        paidAt: new Date('2026-05-10T00:00:00.000Z'),
        expenseCategoryId: category.id,
      }),
    ).rejects.toBeInstanceOf(DefaultWalletNotFoundError);
  });

  it('should throw an error when the expense category does not exist', async () => {
    const user = await createTestUser();

    await createTestWallet({
      userId: user.id,
    });

    await expect(
      adapter.registerPayment({
        debtId: crypto.randomUUID(),
        userId: user.id,
        amount: 500,
        description: 'Aluguel',
        paidAt: new Date('2026-05-10T00:00:00.000Z'),
        expenseCategoryId: '00000000-0000-0000-0000-000000000000',
      }),
    ).rejects.toThrow('Categoria de despesa não encontrada.');
  });

  it('should throw an error when the category belongs to another user', async () => {
    const user = await createTestUser();

    await createTestWallet({
      userId: user.id,
    });

    const anotherUser = await createTestUser();

    const anotherCategory = await createTestExpenseCategory({
      userId: anotherUser.id,
    });

    await expect(
      adapter.registerPayment({
        debtId: crypto.randomUUID(),
        userId: user.id,
        amount: 500,
        description: 'Aluguel',
        paidAt: new Date('2026-05-10T00:00:00.000Z'),
        expenseCategoryId: anotherCategory.id,
      }),
    ).rejects.toThrow('Categoria de despesa não encontrada.');
  });
});
