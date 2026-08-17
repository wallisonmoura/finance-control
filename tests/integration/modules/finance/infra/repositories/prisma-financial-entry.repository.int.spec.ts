import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { FinancialEntryNotFoundError } from '@/modules/finance/domain/errors/financial-entry-not-found.error';
import { DefaultWalletNotFoundError } from '@/shared/infra/errors/default-wallet-not-found.error';
import { PrismaFinancialEntryRepository } from '@/modules/finance/infra/repositories/prisma-financial-entry.repository';
import { PrismaWalletRepository } from '@/modules/wallet/infra/repositories/prisma-wallet.repository';
import { prisma } from '@/shared/infra/database/prisma/client';
import { createTestUser } from '../../../../../helpers/database/create-test-user';
import { createTestWallet } from '../../../../../helpers/database/create-test-wallet';
import { makeTestFinancialEntryEntity } from '../../../../../helpers/database/make-test-financial-entry-entity';
import { createTestExpenseCategory } from '../../../../../helpers/database/create-test-expense-category';
import { createTestFinancialEntry } from '../../../../../helpers/database/create-test-financial-entry';

describe('PrismaFinancialEntryRepository', () => {
  let repository: PrismaFinancialEntryRepository;

  beforeAll(async () => {
    repository = new PrismaFinancialEntryRepository(new PrismaWalletRepository());
  });

  beforeEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('create', () => {
    it("should create an income using the user's default wallet", async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });

      const entry = makeTestFinancialEntryEntity({
        userId: user.id,
        type: FinancialEntryType.INCOME,
        amount: 150,
        description: 'Receita teste',
        date: new Date('2026-04-01T00:00:00.000Z'),
        categoryId: null,
        notes: 'observação',
      });

      const created = await repository.create(entry);

      expect(created.id).toBeDefined();
      expect(created.userId).toBe(user.id);
      expect(created.type).toBe(FinancialEntryType.INCOME);
      expect(created.amount).toBe(150);
      expect(created.description).toBe('Receita teste');
      expect(created.categoryId).toBeNull();

      const persisted = await prisma.transaction.findUnique({
        where: { id: created.id },
      });

      expect(persisted).not.toBeNull();
      expect(persisted?.userId).toBe(user.id);
      expect(persisted?.walletId).toBe(wallet.id);
      expect(Number(persisted?.amount)).toBe(150);
      expect(persisted?.expenseCategoryId).toBeNull();
    });

    it('should create an expense persisting the category', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });

      const category = await createTestExpenseCategory({
        userId: user.id,
        name: 'Combustível',
      });

      const entry = makeTestFinancialEntryEntity({
        userId: user.id,
        type: FinancialEntryType.EXPENSE,
        amount: 70,
        description: 'Despesa teste',
        date: new Date('2026-04-01T00:00:00.000Z'),
        categoryId: category.id,
        notes: null,
      });

      const created = await repository.create(entry);

      expect(created.id).toBeDefined();
      expect(created.type).toBe(FinancialEntryType.EXPENSE);
      expect(created.categoryId).toBe(category.id);

      const persisted = await prisma.transaction.findUnique({
        where: { id: created.id },
      });

      expect(persisted).not.toBeNull();
      expect(persisted?.walletId).toBe(wallet.id);
      expect(persisted?.expenseCategoryId).toBe(category.id);
    });

    it('should throw DefaultWalletNotFoundError when the user has no default wallet', async () => {
      const user = await createTestUser();

      const entry = makeTestFinancialEntryEntity({
        userId: user.id,
        type: FinancialEntryType.INCOME,
        amount: 100,
        description: 'Receita sem wallet',
        date: new Date('2026-04-01T00:00:00.000Z'),
        categoryId: null,
        notes: null,
      });

      await expect(repository.create(entry)).rejects.toBeInstanceOf(
        DefaultWalletNotFoundError,
      );
    });
  });

  describe('findById', () => {
    it('should return an entry by id', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });

      const transaction = await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
        amount: 120,
        description: 'Receita encontrada',
      });

      const found = await repository.findById(transaction.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(transaction.id);
      expect(found?.userId).toBe(user.id);
      expect(found?.type).toBe(FinancialEntryType.INCOME);
      expect(found?.amount).toBe(120);
    });

    it('should return null when the entry does not exist', async () => {
      const found = await repository.findById(
        '550e8400-e29b-41d4-a716-446655440000',
      );

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an income correctly', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });

      const transaction = await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
        amount: 100,
        description: 'Receita original',
      });

      const existing = await repository.findById(transaction.id);

      expect(existing).not.toBeNull();

      const updatedEntity = existing!.update({
        amount: 180,
        description: 'Receita atualizada',
        date: new Date('2026-04-02T00:00:00.000Z'),
        categoryId: null,
        notes: 'nota atualizada',
      });

      const updated = await repository.update(updatedEntity);

      expect(updated.id).toBe(transaction.id);
      expect(updated.amount).toBe(180);
      expect(updated.description).toBe('Receita atualizada');
      expect(updated.type).toBe(FinancialEntryType.INCOME);
      expect(updated.categoryId).toBeNull();

      const persisted = await prisma.transaction.findUnique({
        where: { id: transaction.id },
      });

      expect(Number(persisted?.amount)).toBe(180);
      expect(persisted?.description).toBe('Receita atualizada');
    });

    it('should update an expense correctly', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });

      const category = await createTestExpenseCategory({
        userId: user.id,
        name: 'Combustível',
      });

      const transaction = await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        amount: 50,
        description: 'Despesa original',
        categoryId: category.id,
      });

      const existing = await repository.findById(transaction.id);

      expect(existing).not.toBeNull();

      const updatedEntity = existing!.update({
        amount: 90,
        description: 'Despesa atualizada',
        date: new Date('2026-04-02T00:00:00.000Z'),
        categoryId: category.id,
        notes: null,
      });

      const updated = await repository.update(updatedEntity);

      expect(updated.id).toBe(transaction.id);
      expect(updated.amount).toBe(90);
      expect(updated.description).toBe('Despesa atualizada');
      expect(updated.type).toBe(FinancialEntryType.EXPENSE);
      expect(updated.categoryId).toBe(category.id);

      const persisted = await prisma.transaction.findUnique({
        where: { id: transaction.id },
      });

      expect(Number(persisted?.amount)).toBe(90);
      expect(persisted?.description).toBe('Despesa atualizada');
      expect(persisted?.expenseCategoryId).toBe(category.id);
    });

    it('should throw FinancialEntryNotFoundError when the entry does not exist', async () => {
      const entry = makeTestFinancialEntryEntity({
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        type: FinancialEntryType.INCOME,
        amount: 100,
        description: 'Inexistente',
        date: new Date('2026-04-01T00:00:00.000Z'),
        categoryId: null,
        notes: null,
      });

      await expect(repository.update(entry)).rejects.toBeInstanceOf(
        FinancialEntryNotFoundError,
      );
    });
  });

  describe('delete', () => {
    it('should remove an existing entry', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });

      const transaction = await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
      });

      await repository.delete(transaction.id);

      const persisted = await prisma.transaction.findUnique({
        where: { id: transaction.id },
      });

      expect(persisted).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it("should return only the given user's entries", async () => {
      const user = await createTestUser();
      const otherUser = await createTestUser();

      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });

      const otherWallet = await createTestWallet({
        userId: otherUser.id,
        isDefault: true,
      });

      await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
        description: 'Receita do usuário',
      });

      await createTestFinancialEntry({
        userId: otherUser.id,
        walletId: otherWallet.id,
        type: 'INCOME',
        description: 'Receita de outro usuário',
      });

      const entries = await repository.findByUserId(user.id);

      expect(entries).toHaveLength(1);
      expect(entries[0].userId).toBe(user.id);
      expect(entries[0].description).toBe('Receita do usuário');
    });
  });

  describe('getPeriodTotals', () => {
    it('should sum income and expense and count entries in the period', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });
      const category = await createTestExpenseCategory({ userId: user.id });

      await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
        amount: 1000,
        transactionDate: new Date(2026, 3, 5),
      });
      await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
        amount: 500,
        transactionDate: new Date(2026, 3, 10),
      });
      await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        amount: 300,
        categoryId: category.id,
        transactionDate: new Date(2026, 3, 15),
      });
      await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        amount: 999,
        categoryId: category.id,
        transactionDate: new Date(2026, 4, 1),
      });

      const totals = await repository.getPeriodTotals(
        user.id,
        new Date(2026, 3, 1),
        new Date(2026, 3, 30),
      );

      expect(totals.totalIncome).toBe(1500);
      expect(totals.totalExpense).toBe(300);
      expect(totals.count).toBe(3);
    });

    it('should apply type and category filters', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });
      const categoryA = await createTestExpenseCategory({ userId: user.id });
      const categoryB = await createTestExpenseCategory({ userId: user.id });

      await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        amount: 120,
        categoryId: categoryA.id,
        transactionDate: new Date(2026, 3, 5),
      });
      await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        amount: 80,
        categoryId: categoryB.id,
        transactionDate: new Date(2026, 3, 6),
      });

      const totals = await repository.getPeriodTotals(
        user.id,
        new Date(2026, 3, 1),
        new Date(2026, 3, 30),
        FinancialEntryType.EXPENSE,
        categoryA.id,
      );

      expect(totals.totalIncome).toBe(0);
      expect(totals.totalExpense).toBe(120);
      expect(totals.count).toBe(1);
    });

    it('should return zeroed totals when the period has no entries', async () => {
      const user = await createTestUser();

      const totals = await repository.getPeriodTotals(
        user.id,
        new Date(2026, 3, 1),
        new Date(2026, 3, 30),
      );

      expect(totals).toEqual({ totalIncome: 0, totalExpense: 0, count: 0 });
    });

    it("should only consider the given user's entries", async () => {
      const user = await createTestUser();
      const otherUser = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });
      const otherWallet = await createTestWallet({
        userId: otherUser.id,
        isDefault: true,
      });

      await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
        amount: 100,
        transactionDate: new Date(2026, 3, 5),
      });
      await createTestFinancialEntry({
        userId: otherUser.id,
        walletId: otherWallet.id,
        type: 'INCOME',
        amount: 9999,
        transactionDate: new Date(2026, 3, 5),
      });

      const totals = await repository.getPeriodTotals(
        user.id,
        new Date(2026, 3, 1),
        new Date(2026, 3, 30),
      );

      expect(totals.totalIncome).toBe(100);
      expect(totals.count).toBe(1);
    });
  });

  describe('findByUserIdAndPeriodPaginated', () => {
    it('should return only the requested page, ordered by date/createdAt descending', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });

      for (let day = 1; day <= 5; day += 1) {
        await createTestFinancialEntry({
          userId: user.id,
          walletId: wallet.id,
          type: 'INCOME',
          amount: 10,
          description: `Entry day ${day}`,
          transactionDate: new Date(2026, 3, day),
        });
      }

      const firstPage = await repository.findByUserIdAndPeriodPaginated(
        user.id,
        new Date(2026, 3, 1),
        new Date(2026, 3, 30),
        undefined,
        undefined,
        { skip: 0, take: 2 },
      );

      expect(firstPage).toHaveLength(2);
      expect(firstPage[0].description).toBe('Entry day 5');
      expect(firstPage[1].description).toBe('Entry day 4');

      const secondPage = await repository.findByUserIdAndPeriodPaginated(
        user.id,
        new Date(2026, 3, 1),
        new Date(2026, 3, 30),
        undefined,
        undefined,
        { skip: 2, take: 2 },
      );

      expect(secondPage).toHaveLength(2);
      expect(secondPage[0].description).toBe('Entry day 3');
      expect(secondPage[1].description).toBe('Entry day 2');
    });

    it('should apply type and category filters', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });
      const category = await createTestExpenseCategory({ userId: user.id });

      await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
        description: 'Receita',
        transactionDate: new Date(2026, 3, 5),
      });
      await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'EXPENSE',
        description: 'Despesa',
        categoryId: category.id,
        transactionDate: new Date(2026, 3, 6),
      });

      const page = await repository.findByUserIdAndPeriodPaginated(
        user.id,
        new Date(2026, 3, 1),
        new Date(2026, 3, 30),
        FinancialEntryType.EXPENSE,
        category.id,
        { skip: 0, take: 10 },
      );

      expect(page).toHaveLength(1);
      expect(page[0].description).toBe('Despesa');
    });

    it('should return an empty array when the page is beyond the available data', async () => {
      const user = await createTestUser();
      const wallet = await createTestWallet({
        userId: user.id,
        isDefault: true,
      });

      await createTestFinancialEntry({
        userId: user.id,
        walletId: wallet.id,
        type: 'INCOME',
        transactionDate: new Date(2026, 3, 5),
      });

      const page = await repository.findByUserIdAndPeriodPaginated(
        user.id,
        new Date(2026, 3, 1),
        new Date(2026, 3, 30),
        undefined,
        undefined,
        { skip: 10, take: 10 },
      );

      expect(page).toHaveLength(0);
    });

    it('should return an empty array when the period has no entries', async () => {
      const user = await createTestUser();

      const page = await repository.findByUserIdAndPeriodPaginated(
        user.id,
        new Date(2026, 3, 1),
        new Date(2026, 3, 30),
        undefined,
        undefined,
        { skip: 0, take: 10 },
      );

      expect(page).toHaveLength(0);
    });
  });
});
