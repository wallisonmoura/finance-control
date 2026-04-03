import { UpdateIncomeUseCase } from '../../application/use-cases/update-income.use-case';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeUpdateIncomeUseCase(): UpdateIncomeUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository();

  return new UpdateIncomeUseCase(financialEntryRepository);
}
