import { PrismaBalanceSummaryRepository } from 'tests/unit/modules/balance/infra/repositories/prisma-balance-summary.repository';
import { GetBalanceSummaryUseCase } from '../../application/use-cases/get-balance-summary.use-case';

export function makeGetBalanceSummaryUseCase(): GetBalanceSummaryUseCase {
  const balanceSummaryRepository = new PrismaBalanceSummaryRepository();

  return new GetBalanceSummaryUseCase(balanceSummaryRepository);
}
