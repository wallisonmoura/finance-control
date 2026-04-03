import { DeleteIncomeUseCase } from '../../application/use-cases/delete-income.use-case';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeDeleteIncomeUseCase(): DeleteIncomeUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository();

  return new DeleteIncomeUseCase(financialEntryRepository);
}
