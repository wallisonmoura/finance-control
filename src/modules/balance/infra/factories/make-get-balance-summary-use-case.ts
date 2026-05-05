import { GetBalanceSummaryUseCase } from '../../application/use-cases/get-balance-summary.use-case';
import { PrismaBalanceSummaryRepository } from '../repositories/prisma-balance-summary.repository';

export function makeGetBalanceSummaryUseCase(): GetBalanceSummaryUseCase {
  const balanceSummaryRepository = new PrismaBalanceSummaryRepository();

  return new GetBalanceSummaryUseCase(balanceSummaryRepository);
}
