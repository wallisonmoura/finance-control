import { GetDailyTransactionsUseCase } from '../../application/use-cases/get-daily-transactions.use-case';
import { PrismaWalletRepository } from '@/modules/wallet/infra/repositories/prisma-wallet.repository';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeGetDailyTransactionsUseCase(): GetDailyTransactionsUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository(
    new PrismaWalletRepository(),
  );

  return new GetDailyTransactionsUseCase(financialEntryRepository);
}
