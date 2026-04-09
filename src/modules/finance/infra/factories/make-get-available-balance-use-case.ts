import { GetAvailableBalanceUseCase } from '../../application/use-cases/get-available-balance.use-case';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeGetAvailableBalanceUseCase(): GetAvailableBalanceUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository();

  return new GetAvailableBalanceUseCase(financialEntryRepository);
}
