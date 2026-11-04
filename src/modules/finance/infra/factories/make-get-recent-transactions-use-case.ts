import { GetRecentTransactionsUseCase } from '../../application/use-cases/get-recent-transactions.use-case';
import { PrismaWalletRepository } from '@/modules/wallet/infra/repositories/prisma-wallet.repository';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeGetRecentTransactionsUseCase(): GetRecentTransactionsUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository(
    new PrismaWalletRepository(),
  );

  return new GetRecentTransactionsUseCase(financialEntryRepository);
}
