import { UpdateExpenseUseCase } from '../../application/use-cases/update-expense.use-case';
import { PrismaExpenseCategoryRepository } from '../repositories/prisma-expense-category.repository';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeUpdateExpenseUseCase(): UpdateExpenseUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository();
  const expenseCategoryRepository = new PrismaExpenseCategoryRepository();

  return new UpdateExpenseUseCase(
    financialEntryRepository,
    expenseCategoryRepository,
  );
}
