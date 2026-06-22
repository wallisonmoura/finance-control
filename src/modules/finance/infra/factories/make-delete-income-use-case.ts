import { DeleteIncomeUseCase } from '../../application/use-cases/delete-income.use-case';
import { PrismaWalletRepository } from '@/modules/wallet/infra/repositories/prisma-wallet.repository';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeDeleteIncomeUseCase(): DeleteIncomeUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository(
    new PrismaWalletRepository(),
  );

  return new DeleteIncomeUseCase(financialEntryRepository);
}
