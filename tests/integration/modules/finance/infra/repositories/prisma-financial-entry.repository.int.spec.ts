import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { FinancialEntryNotFoundError } from '@/modules/finance/domain/errors/financial-entry-not-found.error';
import { DefaultWalletNotFoundError } from '@/shared/infra/errors/default-wallet-not-found.error';
import { PrismaFinancialEntryRepository } from '@/modules/finance/infra/repositories/prisma-financial-entry.repository';
import { prisma } from '@/shared/infra/database/prisma/client';
import { createTestExpenseCategory } from 'tests/helpers/database/create-test-expense-category';
import { createTestFinancialEntry } from 'tests/helpers/database/create-test-financial-entry';
import { createTestUser } from 'tests/helpers/database/create-test-user';
import { createTestWallet } from 'tests/helpers/database/create-test-wallet';
import { makeTestFinancialEntryEntity } from 'tests/helpers/database/make-test-financial-entry-entity';

describe('PrismaFinancialEntryRepository', () => {
  let repository: PrismaFinancialEntryRepository;

  beforeAll(async () => {
    repository = new PrismaFinancialEntryRepository();
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
    it('deve criar uma income usando a wallet padrão do usuário', async () => {
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

    it('deve criar uma expense persistindo a categoria', async () => {
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

    it('deve lançar DefaultWalletNotFoundError quando o usuário não possuir wallet padrão', async () => {
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
    it('deve retornar um lançamento por id', async () => {
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

    it('deve retornar null quando o lançamento não existir', async () => {
      const found = await repository.findById(
        '550e8400-e29b-41d4-a716-446655440000',
      );

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('deve atualizar uma income corretamente', async () => {
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

    it('deve atualizar uma expense corretamente', async () => {
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

    it('deve lançar FinancialEntryNotFoundError quando o lançamento não existir', async () => {
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
    it('deve remover um lançamento existente', async () => {
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
    it('deve retornar apenas os lançamentos do usuário informado', async () => {
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
});
