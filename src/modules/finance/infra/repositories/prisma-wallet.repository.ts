import { prisma } from '@/shared/infra/database/prisma/client';

type DefaultWalletOutput = {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
};

export class PrismaWalletRepository {
  async findDefaultByUserId(
    userId: string,
  ): Promise<DefaultWalletOutput | null> {
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId,
        isDefault: true,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        isDefault: true,
      },
    });

    if (wallet) {
      return wallet;
    }

    return prisma.wallet.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        userId: true,
        name: true,
        isDefault: true,
      },
    });
  }
}
