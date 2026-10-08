import { PrismaExpenseCategoryRepository } from '@/modules/finance/infra/repositories/prisma-expense-category.repository';
import { prisma } from '@/shared/infra/database/prisma/client';
import { createTestUser } from '../../../../../helpers/database/create-test-user';
import { createTestExpenseCategory } from '../../../../../helpers/database/create-test-expense-category';

describe('PrismaExpenseCategoryRepository', () => {
  let repository: PrismaExpenseCategoryRepository;

  beforeAll(() => {
    repository = new PrismaExpenseCategoryRepository();
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

  describe('findById', () => {
    it('should return a category by id', async () => {
      const user = await createTestUser();

      const category = await createTestExpenseCategory({
        userId: user.id,
        name: 'Combustível',
        slug: 'combustivel',
      });

      const found = await repository.findById(category.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(category.id);
      expect(found?.userId).toBe(user.id);
      expect(found?.name).toBe('Combustível');
      expect(found?.slug).toBe('combustivel');
    });

    it('should return null when the category does not exist', async () => {
      const found = await repository.findById(
        '550e8400-e29b-41d4-a716-446655440000',
      );

      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it("should return only the given user's categories", async () => {
      const user = await createTestUser({
        email: 'category-user-1@test.com',
      });

      const otherUser = await createTestUser({
        email: 'category-user-2@test.com',
      });

      await createTestExpenseCategory({
        userId: user.id,
        name: 'Combustível',
        slug: 'combustivel',
      });

      await createTestExpenseCategory({
        userId: user.id,
        name: 'Alimentação',
        slug: 'alimentacao',
      });

      await createTestExpenseCategory({
        userId: otherUser.id,
        name: 'Categoria de outro usuário',
        slug: 'categoria-outro-usuario',
      });

      const categories = await repository.findByUserId(user.id);

      expect(categories).toHaveLength(2);
      expect(categories.every((category) => category.userId === user.id)).toBe(
        true,
      );

      expect(categories.map((category) => category.name)).toEqual([
        'Alimentação',
        'Combustível',
      ]);
    });

    it('should return an empty list when the user has no categories', async () => {
      const user = await createTestUser();

      const categories = await repository.findByUserId(user.id);

      expect(categories).toEqual([]);
    });
  });

  describe('findActiveByUserId', () => {
    it('should return only active categories of the given user', async () => {
      const user = await createTestUser({
        email: 'active-category-user-1@test.com',
      });
      const otherUser = await createTestUser({
        email: 'active-category-user-2@test.com',
      });

      await createTestExpenseCategory({
        userId: user.id,
        name: 'Combustivel',
        slug: 'combustivel',
      });
      await createTestExpenseCategory({
        userId: user.id,
        name: 'Inativa',
        slug: 'inativa',
        isActive: false,
      });
      await createTestExpenseCategory({
        userId: otherUser.id,
        name: 'Outro usuario',
        slug: 'outro-usuario',
      });

      const categories = await repository.findActiveByUserId(user.id);

      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe('Combustivel');
    });
  });
  describe('update', () => {
    it('should persist and clear the monthly limit', async () => {
      const user = await createTestUser();
      const created = await createTestExpenseCategory({
        userId: user.id,
        name: 'Lazer',
        slug: 'lazer',
      });
      const domain = (await repository.findById(created.id))!;

      expect(domain.monthlyLimit).toBeNull();

      const saved = await repository.update(domain.withMonthlyLimit(300.5));
      expect(saved.monthlyLimit).toBe(300.5);
      expect((await repository.findById(created.id))!.monthlyLimit).toBe(300.5);

      const cleared = await repository.update(saved.withMonthlyLimit(null));
      expect(cleared.monthlyLimit).toBeNull();
      expect((await repository.findById(created.id))!.monthlyLimit).toBeNull();
    });

    it('should reject a non-positive limit at the database level', async () => {
      const user = await createTestUser();
      const created = await createTestExpenseCategory({
        userId: user.id,
        name: 'Lazer',
        slug: 'lazer',
      });

      await expect(
        prisma.expenseCategory.update({
          where: { id: created.id },
          data: { monthlyLimit: 0 },
        }),
      ).rejects.toThrow();
    });
  });
});
