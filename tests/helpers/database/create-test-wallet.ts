import { prisma } from '@/shared/infra/database/prisma/client';

type CreateTestWalletInput = {
  userId: string;
  name?: string;
  isDefault?: boolean;
  bankBalance?: number;
  cashBalance?: number;
  receivableBalance?: number;
};

export async function createTestWallet(input: CreateTestWalletInput) {
  return prisma.wallet.create({
    data: {
      userId: input.userId,
      name: input.name ?? 'Carteira Teste',
      isDefault: input.isDefault ?? true,
      bankBalance: input.bankBalance ?? 0,
      cashBalance: input.cashBalance ?? 0,
      receivableBalance: input.receivableBalance ?? 0,
    },
  });
}
