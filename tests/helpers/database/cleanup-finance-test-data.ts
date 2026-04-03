import { prisma } from '@/shared/infra/database/prisma/client';

export async function cleanupFinanceTestData() {
  await prisma.transaction.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
}
