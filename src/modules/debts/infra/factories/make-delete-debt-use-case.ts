import { DeleteDebtUseCase } from '../../application/use-cases/delete-debt.use-case';
import { PrismaDebtRepository } from '../repositories/prisma-debt.repository';

export function makeDeleteDebtUseCase(): DeleteDebtUseCase {
  const debtRepository = new PrismaDebtRepository();

  return new DeleteDebtUseCase(debtRepository);
}
