import { Prisma, Wallet as PrismaWallet } from '@prisma/client';
import { Wallet } from '../../domain/entities/wallet.entity';

type PrismaWalletLike = PrismaWallet | Prisma.WalletGetPayload<object>;

export class PrismaWalletMapper {
  static toDomain(raw: PrismaWalletLike): Wallet {
    return Wallet.create({
      id: raw.id,
      userId: raw.userId,
      bankBalance: Number(raw.bankBalance),
      cashBalance: Number(raw.cashBalance),
      receivableBalance: Number(raw.receivableBalance),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
