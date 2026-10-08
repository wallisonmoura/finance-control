import { SetCategoryMonthlyLimitUseCase } from '@/modules/finance/application/use-cases/set-category-monthly-limit.use-case';
import { ExpenseCategory } from '@/modules/finance/domain/entities/expense-category.entity';
import { ExpenseCategoryNotFoundError } from '@/modules/finance/domain/errors/expense-category-not-found.error';
import { InactiveExpenseCategoryError } from '@/modules/finance/domain/errors/inactive-expense-category.error';
import { InvalidExpenseCategoryMonthlyLimitError } from '@/modules/finance/domain/errors/invalid-expense-category-monthly-limit.error';

import { InMemoryExpenseCategoryRepository } from './fakes/in-memory-expense-category.repository';

function cat(id: string, userId: string, isActive = true) {
  return ExpenseCategory.create({
    id,
    userId,
    name: id,
    slug: id,
    isActive,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('SetCategoryMonthlyLimitUseCase', () => {
  let repository: InMemoryExpenseCategoryRepository;
  let sut: SetCategoryMonthlyLimitUseCase;

  beforeEach(() => {
    repository = new InMemoryExpenseCategoryRepository([
      cat('lazer', 'user-1'),
      cat('outra', 'user-2'),
      cat('velha', 'user-1', false),
    ]);
    sut = new SetCategoryMonthlyLimitUseCase(repository);
  });

  it('should set and then remove the monthly limit', async () => {
    await expect(
      sut.execute({ userId: 'user-1', categoryId: 'lazer', monthlyLimit: 300 }),
    ).resolves.toEqual({
      id: 'lazer',
      name: 'lazer',
      slug: 'lazer',
      monthlyLimit: 300,
    });

    await expect(
      sut.execute({ userId: 'user-1', categoryId: 'lazer', monthlyLimit: null }),
    ).resolves.toMatchObject({ monthlyLimit: null });
    expect((await repository.findById('lazer'))!.monthlyLimit).toBeNull();
  });

  it('should not find a missing category', async () => {
    await expect(
      sut.execute({ userId: 'user-1', categoryId: 'nope', monthlyLimit: 10 }),
    ).rejects.toThrow(ExpenseCategoryNotFoundError);
  });

  it('should hide categories of other users as not found and leave them untouched', async () => {
    await expect(
      sut.execute({ userId: 'user-1', categoryId: 'outra', monthlyLimit: 10 }),
    ).rejects.toThrow(ExpenseCategoryNotFoundError);
    expect((await repository.findById('outra'))!.monthlyLimit).toBeNull();
  });

  it('should refuse a goal on an inactive category', async () => {
    await expect(
      sut.execute({ userId: 'user-1', categoryId: 'velha', monthlyLimit: 10 }),
    ).rejects.toThrow(InactiveExpenseCategoryError);
  });

  it('should refuse a non-positive limit', async () => {
    await expect(
      sut.execute({ userId: 'user-1', categoryId: 'lazer', monthlyLimit: 0 }),
    ).rejects.toThrow(InvalidExpenseCategoryMonthlyLimitError);
    expect((await repository.findById('lazer'))!.monthlyLimit).toBeNull();
  });
});
