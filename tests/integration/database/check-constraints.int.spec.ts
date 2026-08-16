import { Prisma, TransactionType, DebtStatus, DebtType } from '@prisma/client';

import { prisma } from '@/shared/infra/database/prisma/client';
import { createTestUser } from '../../helpers/database/create-test-user';
import { createTestWallet } from '../../helpers/database/create-test-wallet';
import { createTestExpenseCategory } from '../../helpers/database/create-test-expense-category';

describe('Database CHECK constraints', () => {
  afterEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.debt.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('wallets balance constraints', () => {
    it('should reject a negative bank_balance', async () => {
      const user = await createTestUser();

      await expect(
        createTestWallet({ userId: user.id, bankBalance: -1 }),
      ).rejects.toThrow();
    });

    it('should reject a negative cash_balance', async () => {
      const user = await createTestUser();

      await expect(
        createTestWallet({ userId: user.id, cashBalance: -1 }),
      ).rejects.toThrow();
    });

    it('should reject a negative receivable_balance', async () => {
      const user = await createTestUser();

      await expect(
        createTestWallet({ userId: user.id, receivableBalance: -1 }),
      ).rejects.toThrow();
    });
  });

  describe('transactions amount constraint', () => {
    it('should reject a transaction with amount <= 0', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });

      await expect(
        prisma.transaction.create({
          data: {
            userId: user.id,
            walletId: wallet.id,
            type: TransactionType.INCOME,
            amount: new Prisma.Decimal(0),
            description: 'Invalid amount',
            transactionDate: new Date('2026-04-01'),
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('debts amount constraint', () => {
    it('should reject a debt with amount <= 0', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });

      await expect(
        prisma.debt.create({
          data: {
            userId: user.id,
            walletId: wallet.id,
            description: 'Invalid amount',
            amount: new Prisma.Decimal(0),
            dueDate: new Date('2026-05-15'),
            type: DebtType.ONE_TIME,
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('transactions expense category constraint', () => {
    it('should reject an EXPENSE transaction without expense_category_id', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });

      await expect(
        prisma.transaction.create({
          data: {
            userId: user.id,
            walletId: wallet.id,
            type: TransactionType.EXPENSE,
            amount: new Prisma.Decimal(10),
            description: 'Expense without category',
            transactionDate: new Date('2026-04-01'),
            expenseCategoryId: null,
          },
        }),
      ).rejects.toThrow();
    });

    it('should reject an INCOME transaction with an expense_category_id', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });
      const category = await createTestExpenseCategory({ userId: user.id });

      await expect(
        prisma.transaction.create({
          data: {
            userId: user.id,
            walletId: wallet.id,
            type: TransactionType.INCOME,
            amount: new Prisma.Decimal(10),
            description: 'Income with category',
            transactionDate: new Date('2026-04-01'),
            expenseCategoryId: category.id,
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('debts paid state constraint', () => {
    it('should reject a PENDING debt with paid_at set', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });

      await expect(
        prisma.debt.create({
          data: {
            userId: user.id,
            walletId: wallet.id,
            description: 'Pending with paidAt',
            amount: new Prisma.Decimal(10),
            dueDate: new Date('2026-05-15'),
            type: DebtType.ONE_TIME,
            status: DebtStatus.PENDING,
            paidAt: new Date('2026-05-10'),
          },
        }),
      ).rejects.toThrow();
    });

    it('should reject a PENDING debt with payment_source set', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });

      await expect(
        prisma.debt.create({
          data: {
            userId: user.id,
            walletId: wallet.id,
            description: 'Pending with paymentSource',
            amount: new Prisma.Decimal(10),
            dueDate: new Date('2026-05-15'),
            type: DebtType.ONE_TIME,
            status: DebtStatus.PENDING,
            paymentSource: 'BANK',
          },
        }),
      ).rejects.toThrow();
    });

    it('should reject a PAID debt without paid_at', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });

      await expect(
        prisma.debt.create({
          data: {
            userId: user.id,
            walletId: wallet.id,
            description: 'Paid without paidAt',
            amount: new Prisma.Decimal(10),
            dueDate: new Date('2026-05-15'),
            type: DebtType.ONE_TIME,
            status: DebtStatus.PAID,
            paymentSource: 'BANK',
          },
        }),
      ).rejects.toThrow();
    });

    it('should reject a PAID debt without payment_source', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({ userId: user.id });

      await expect(
        prisma.debt.create({
          data: {
            userId: user.id,
            walletId: wallet.id,
            description: 'Paid without paymentSource',
            amount: new Prisma.Decimal(10),
            dueDate: new Date('2026-05-15'),
            type: DebtType.ONE_TIME,
            status: DebtStatus.PAID,
            paidAt: new Date('2026-05-10'),
          },
        }),
      ).rejects.toThrow();
    });
  });
});
