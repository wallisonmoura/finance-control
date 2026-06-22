import { CalculateMonthlySummaryUseCase } from '../../application/use-cases/calculate-monthly-summary.use-case';
import { PrismaWalletRepository } from '@/modules/wallet/infra/repositories/prisma-wallet.repository';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeCalculateMonthlySummaryUseCase(): CalculateMonthlySummaryUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository(
    new PrismaWalletRepository(),
  );

  return new CalculateMonthlySummaryUseCase(financialEntryRepository);
}
