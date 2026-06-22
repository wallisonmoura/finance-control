import { CalculateDailyProfitUseCase } from '../../application/use-cases/calculate-daily-profit.use-case';
import { PrismaWalletRepository } from '@/modules/wallet/infra/repositories/prisma-wallet.repository';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeCalculateDailyProfitUseCase(): CalculateDailyProfitUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository(
    new PrismaWalletRepository(),
  );

  return new CalculateDailyProfitUseCase(financialEntryRepository);
}
