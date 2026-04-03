import { DeleteExpenseUseCase } from '../../application/use-cases/delete-expense.use-case';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeDeleteExpenseUseCase(): DeleteExpenseUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository();

  return new DeleteExpenseUseCase(financialEntryRepository);
}
