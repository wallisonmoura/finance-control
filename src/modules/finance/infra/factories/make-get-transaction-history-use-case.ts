import { GetTransactionHistoryUseCase } from '../../application/use-cases/get-transaction-history.use-case';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeGetTransactionHistoryUseCase(): GetTransactionHistoryUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository();

  return new GetTransactionHistoryUseCase(financialEntryRepository);
}
