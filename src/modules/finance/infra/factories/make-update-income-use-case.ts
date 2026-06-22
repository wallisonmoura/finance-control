import { UpdateIncomeUseCase } from '../../application/use-cases/update-income.use-case';
import { PrismaWalletRepository } from '@/modules/wallet/infra/repositories/prisma-wallet.repository';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeUpdateIncomeUseCase(): UpdateIncomeUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository(
    new PrismaWalletRepository(),
  );

  return new UpdateIncomeUseCase(financialEntryRepository);
}
