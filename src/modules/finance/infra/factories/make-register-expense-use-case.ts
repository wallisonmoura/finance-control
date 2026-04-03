import { RegisterExpenseUseCase } from '../../application/use-cases/register-expense.use-case';
import { PrismaExpenseCategoryRepository } from '../repositories/prisma-expense-category.repository';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeRegisterExpenseUseCase(): RegisterExpenseUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository();
  const expenseCategoryRepository = new PrismaExpenseCategoryRepository();

  return new RegisterExpenseUseCase(
    financialEntryRepository,
    expenseCategoryRepository,
  );
}
