import { SetCategoryMonthlyLimitUseCase } from '../../application/use-cases/set-category-monthly-limit.use-case';
import { PrismaExpenseCategoryRepository } from '../repositories/prisma-expense-category.repository';

export function makeSetCategoryMonthlyLimitUseCase(): SetCategoryMonthlyLimitUseCase {
  return new SetCategoryMonthlyLimitUseCase(new PrismaExpenseCategoryRepository());
}
