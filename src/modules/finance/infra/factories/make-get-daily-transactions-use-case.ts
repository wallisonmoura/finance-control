import { GetDailyTransactionsUseCase } from '../../application/use-cases/get-daily-transactions.use-case';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeGetDailyTransactionsUseCase(): GetDailyTransactionsUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository();

  return new GetDailyTransactionsUseCase(financialEntryRepository);
}
