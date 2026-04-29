import { UpdateDebtUseCase } from '../../application/use-cases/update-debt.use-case';
import { PrismaDebtRepository } from '../repositories/prisma-debt.repository';

export function makeUpdateDebtUseCase(): UpdateDebtUseCase {
  const debtRepository = new PrismaDebtRepository();

  return new UpdateDebtUseCase(debtRepository);
}
