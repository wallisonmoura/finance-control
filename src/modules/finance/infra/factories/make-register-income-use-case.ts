import { RegisterIncomeUseCase } from '../../application/use-cases/register-income.use-case';
import { PrismaWalletRepository } from '@/modules/wallet/infra/repositories/prisma-wallet.repository';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeRegisterIncomeUseCase(): RegisterIncomeUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository(
    new PrismaWalletRepository(),
  );

  return new RegisterIncomeUseCase(financialEntryRepository);
}
