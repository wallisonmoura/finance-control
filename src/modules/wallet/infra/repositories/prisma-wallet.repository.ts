import { prisma } from '@/shared/infra/database/prisma/client';
import { Wallet } from '../../domain/entities/wallet.entity';
import { WalletRepository } from '../../domain/repositories/wallet.repository';
import { PrismaWalletMapper } from '../mappers/prisma-wallet.mapper';

export class PrismaWalletRepository implements WalletRepository {
  async findByUserId(userId: string): Promise<Wallet | null> {
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });

    if (!wallet) {
      return null;
    }

    return PrismaWalletMapper.toDomain(wallet);
  }

  async update(wallet: Wallet): Promise<Wallet> {
    const persistedWallet = await prisma.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        bankBalance: wallet.bankBalance,
        cashBalance: wallet.cashBalance,
        receivableBalance: wallet.receivableBalance,
      },
    });

    return PrismaWalletMapper.toDomain(persistedWallet);
  }
}
