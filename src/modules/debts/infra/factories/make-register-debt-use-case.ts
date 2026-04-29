import { RegisterDebtUseCase } from '../../application/use-cases/register-debt.use-case';
import { PrismaDebtRepository } from '../repositories/prisma-debt.repository';

export function makeRegisterDebtUseCase(): RegisterDebtUseCase {
  const debtRepository = new PrismaDebtRepository();

  return new RegisterDebtUseCase(debtRepository);
}
