import { GetWalletUseCase } from '../../application/use-cases/get-wallet.use-case';
import { PrismaWalletRepository } from '../repositories/prisma-wallet.repository';

export function makeGetWalletUseCase() {
  const walletRepository = new PrismaWalletRepository();

  return new GetWalletUseCase(walletRepository);
}
