import { PrismaWalletRepository } from '@/modules/wallet/infra/repositories/prisma-wallet.repository';

import { GetIncomeGoalsUseCase } from '../../application/use-cases/get-income-goals.use-case';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';
import { PrismaIncomeGoalRepository } from '../repositories/prisma-income-goal.repository';

export function makeGetIncomeGoalsUseCase(): GetIncomeGoalsUseCase {
  return new GetIncomeGoalsUseCase(
    new PrismaFinancialEntryRepository(new PrismaWalletRepository()),
    new PrismaIncomeGoalRepository(),
  );
}
