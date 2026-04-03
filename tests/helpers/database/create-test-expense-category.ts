import { prisma } from '@/shared/infra/database/prisma/client';

type CreateTestExpenseCategoryInput = {
  userId: string;
  name?: string;
  slug?: string;
  isActive?: boolean;
};

export async function createTestExpenseCategory(
  input: CreateTestExpenseCategoryInput,
) {
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return prisma.expenseCategory.create({
    data: {
      userId: input.userId,
      name: input.name ?? 'Combustível',
      slug: input.slug ?? `combustivel-${unique}`,
      isActive: input.isActive ?? true,
    },
  });
}
