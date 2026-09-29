import { PrismaWalletRepository } from '@/modules/wallet/infra/repositories/prisma-wallet.repository';

import { GetMonthlyInsightsUseCase } from '../../application/use-cases/get-monthly-insights.use-case';
import { PrismaExpenseCategoryRepository } from '../repositories/prisma-expense-category.repository';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeGetMonthlyInsightsUseCase(): GetMonthlyInsightsUseCase {
  return new GetMonthlyInsightsUseCase(
    new PrismaFinancialEntryRepository(new PrismaWalletRepository()),
    new PrismaExpenseCategoryRepository(),
  );
}
