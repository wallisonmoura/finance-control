import { prisma } from '@/shared/infra/database/prisma/client';
import { Prisma, TransactionType } from '@prisma/client';

type CreateTestFinancialEntryInput = {
  userId: string;
  walletId: string;
  type: 'INCOME' | 'EXPENSE';
  amount?: number;
  description?: string;
  transactionDate?: Date;
  categoryId?: string | null;
};

export async function createTestFinancialEntry(
  input: CreateTestFinancialEntryInput,
) {
  return prisma.transaction.create({
    data: {
      userId: input.userId,
      walletId: input.walletId,
      type:
        input.type === 'INCOME'
          ? TransactionType.INCOME
          : TransactionType.EXPENSE,
      amount: new Prisma.Decimal(input.amount ?? 100),
      description: input.description ?? 'Lançamento de teste',
      transactionDate: input.transactionDate ?? new Date('2026-04-01'),
      expenseCategoryId: input.categoryId ?? null,
    },
  });
}
