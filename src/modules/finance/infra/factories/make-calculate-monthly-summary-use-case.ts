import { CalculateMonthlySummaryUseCase } from '../../application/use-cases/calculate-monthly-summary.use-case';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeCalculateMonthlySummaryUseCase(): CalculateMonthlySummaryUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository();

  return new CalculateMonthlySummaryUseCase(financialEntryRepository);
}
