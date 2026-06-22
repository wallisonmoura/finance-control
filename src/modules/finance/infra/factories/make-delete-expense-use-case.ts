import { DeleteExpenseUseCase } from '../../application/use-cases/delete-expense.use-case';
import { PrismaWalletRepository } from '@/modules/wallet/infra/repositories/prisma-wallet.repository';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeDeleteExpenseUseCase(): DeleteExpenseUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository(
    new PrismaWalletRepository(),
  );

  return new DeleteExpenseUseCase(financialEntryRepository);
}
