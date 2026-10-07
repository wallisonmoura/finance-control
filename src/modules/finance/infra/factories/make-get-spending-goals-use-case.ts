import { PrismaWalletRepository } from '@/modules/wallet/infra/repositories/prisma-wallet.repository';

import { GetSpendingGoalsUseCase } from '../../application/use-cases/get-spending-goals.use-case';
import { PrismaExpenseCategoryRepository } from '../repositories/prisma-expense-category.repository';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeGetSpendingGoalsUseCase(): GetSpendingGoalsUseCase {
  return new GetSpendingGoalsUseCase(
    new PrismaFinancialEntryRepository(new PrismaWalletRepository()),
    new PrismaExpenseCategoryRepository(),
  );
}
