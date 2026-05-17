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
    it('deve retornar uma categoria por id', async () => {
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

    it('deve retornar null quando a categoria não existir', async () => {
      const found = await repository.findById(
        '550e8400-e29b-41d4-a716-446655440000',
      );

      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('deve retornar apenas as categorias do usuário informado', async () => {
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

    it('deve retornar lista vazia quando o usuário não possuir categorias', async () => {
      const user = await createTestUser();

      const categories = await repository.findByUserId(user.id);

      expect(categories).toEqual([]);
    });
  });

  describe('findActiveByUserId', () => {
    it('deve retornar apenas categorias ativas do usuario informado', async () => {
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
});
