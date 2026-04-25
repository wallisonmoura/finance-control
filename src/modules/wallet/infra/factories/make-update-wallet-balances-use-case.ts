import { UpdateWalletBalancesUseCase } from '../../application/use-cases/update-wallet-balances.use-case';
import { PrismaWalletRepository } from '../repositories/prisma-wallet.repository';

export function makeUpdateWalletBalancesUseCase() {
  const walletRepository = new PrismaWalletRepository();

  return new UpdateWalletBalancesUseCase(walletRepository);
}
