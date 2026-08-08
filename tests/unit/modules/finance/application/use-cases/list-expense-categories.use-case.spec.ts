import { ExpenseCategory } from '@/modules/finance/domain/entities/expense-category.entity';
import { ListExpenseCategoriesUseCase } from '@/modules/finance/application/use-cases/list-expense-categories.use-case';
import { InMemoryExpenseCategoryRepository } from './fakes/in-memory-expense-category.repository';

function makeCategory(input: {
  id: string;
  userId: string;
  name: string;
  slug: string;
  isActive?: boolean;
}) {
  return ExpenseCategory.create({
    id: input.id,
    userId: input.userId,
    name: input.name,
    slug: input.slug,
    isActive: input.isActive ?? true,
    createdAt: new Date('2026-05-01T00:00:00.000Z'),
    updatedAt: new Date('2026-05-01T00:00:00.000Z'),
  });
}

describe('ListExpenseCategoriesUseCase', () => {
  it('should list only active categories of the given user', async () => {
    const repository = new InMemoryExpenseCategoryRepository([
      makeCategory({
        id: 'category-1',
        userId: 'user-1',
        name: 'Combustivel',
        slug: 'combustivel',
      }),
      makeCategory({
        id: 'category-2',
        userId: 'user-1',
        name: 'Categoria inativa',
        slug: 'categoria-inativa',
        isActive: false,
      }),
      makeCategory({
        id: 'category-3',
        userId: 'user-2',
        name: 'Outro usuario',
        slug: 'outro-usuario',
      }),
    ]);

    const useCase = new ListExpenseCategoriesUseCase(repository);

    const categories = await useCase.execute({ userId: 'user-1' });

    expect(categories).toEqual([
      {
        id: 'category-1',
        name: 'Combustivel',
        slug: 'combustivel',
      },
    ]);
  });
});
