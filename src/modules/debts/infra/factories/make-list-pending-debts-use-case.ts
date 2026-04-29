import { ListPendingDebtsUseCase } from '../../application/use-cases/list-pending-debts.use-case';
import { PrismaDebtRepository } from '../repositories/prisma-debt.repository';

export function makeListPendingDebtsUseCase(): ListPendingDebtsUseCase {
  const debtRepository = new PrismaDebtRepository();

  return new ListPendingDebtsUseCase(debtRepository);
}
