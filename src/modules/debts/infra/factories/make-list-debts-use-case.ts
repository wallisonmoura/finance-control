import { ListDebtsUseCase } from '../../application/use-cases/list-debts.use-case';
import { PrismaDebtRepository } from '../repositories/prisma-debt.repository';

export function makeListDebtsUseCase(): ListDebtsUseCase {
  const debtRepository = new PrismaDebtRepository();

  return new ListDebtsUseCase(debtRepository);
}
