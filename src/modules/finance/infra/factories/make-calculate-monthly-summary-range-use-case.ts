import { CalculateMonthlySummaryRangeUseCase } from '../../application/use-cases/calculate-monthly-summary-range.use-case';
import { PrismaWalletRepository } from '@/modules/wallet/infra/repositories/prisma-wallet.repository';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeCalculateMonthlySummaryRangeUseCase(): CalculateMonthlySummaryRangeUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository(
    new PrismaWalletRepository(),
  );

  return new CalculateMonthlySummaryRangeUseCase(financialEntryRepository);
}
