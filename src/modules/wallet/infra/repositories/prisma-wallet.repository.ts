import { prisma } from '@/shared/infra/database/prisma/client';
import { orNotFound } from '@/shared/infra/database/prisma/or-not-found';
import { Wallet } from '../../domain/entities/wallet.entity';
import { WalletNotFoundError } from '../../domain/errors/wallet-not-found.error';
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
    const persistedWallet = await orNotFound(
      prisma.wallet.update({
        where: {
          id: wallet.id,
          userId: wallet.userId,
        },
        data: {
          bankBalance: wallet.bankBalance,
          cashBalance: wallet.cashBalance,
          receivableBalance: wallet.receivableBalance,
        },
      }),
      () => new WalletNotFoundError(),
    );

    return PrismaWalletMapper.toDomain(persistedWallet);
  }
}
