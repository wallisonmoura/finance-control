import { CalculateDailyProfitUseCase } from '../../application/use-cases/calculate-daily-profit.use-case';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeCalculateDailyProfitUseCase(): CalculateDailyProfitUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository();

  return new CalculateDailyProfitUseCase(financialEntryRepository);
}
