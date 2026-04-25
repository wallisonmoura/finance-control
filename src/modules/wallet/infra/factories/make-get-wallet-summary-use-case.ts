import { GetWalletSummaryUseCase } from '../../application/use-cases/get-wallet-summary.use-case';
import { PrismaWalletRepository } from '../repositories/prisma-wallet.repository';

export function makeGetWalletSummaryUseCase() {
  const walletRepository = new PrismaWalletRepository();

  return new GetWalletSummaryUseCase(walletRepository);
}
