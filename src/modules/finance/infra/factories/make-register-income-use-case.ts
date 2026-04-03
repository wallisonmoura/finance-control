import { RegisterIncomeUseCase } from '../../application/use-cases/register-income.use-case';
import { PrismaFinancialEntryRepository } from '../repositories/prisma-financial-entry.repository';

export function makeRegisterIncomeUseCase(): RegisterIncomeUseCase {
  const financialEntryRepository = new PrismaFinancialEntryRepository();

  return new RegisterIncomeUseCase(financialEntryRepository);
}
