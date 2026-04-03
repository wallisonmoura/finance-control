import { prisma } from '@/shared/infra/database/prisma/client';

type CreateTestWalletInput = {
  userId: string;
  name?: string;
  isDefault?: boolean;
};

export async function createTestWallet(input: CreateTestWalletInput) {
  return prisma.wallet.create({
    data: {
      userId: input.userId,
      name: input.name ?? 'Carteira Teste',
      isDefault: input.isDefault ?? true,
    },
  });
}
