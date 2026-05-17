import { ListExpenseCategoriesUseCase } from '../../application/use-cases/list-expense-categories.use-case';
import { PrismaExpenseCategoryRepository } from '../repositories/prisma-expense-category.repository';

export function makeListExpenseCategoriesUseCase(): ListExpenseCategoriesUseCase {
  const expenseCategoryRepository = new PrismaExpenseCategoryRepository();

  return new ListExpenseCategoriesUseCase(expenseCategoryRepository);
}
