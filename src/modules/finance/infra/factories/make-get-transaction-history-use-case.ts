import { GetTransactionHistoryUseCase } from '../../application/use-cases/get-transaction-history.use-case';
import { PrismaWalletRepository } from '@/modules/wallet/infra/repositories/prisma-wallet.repository';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeGetTransactionHistoryUseCase(): GetTransactionHistoryUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository(
    new PrismaWalletRepository(),
  );

  return new GetTransactionHistoryUseCase(financialEntryRepository);
}
