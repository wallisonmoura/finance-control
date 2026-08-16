import { prisma } from '@/shared/infra/database/prisma/client';

type CreateTestUserInput = {
  name?: string;
  email?: string;
  passwordHash?: string;
};

/**
 * Creates a user for tests, with a blank slate: no wallet, no expense
 * categories.
 *
 * A DB-level trigger (prisma/migrations/*_add_user_provisioning_trigger)
 * auto-provisions a default Wallet and the 26 default ExpenseCategory rows
 * for every new user, regardless of insert path. Most tests in this suite
 * build their own wallet/category fixtures from a blank slate, so this
 * helper deletes the trigger's output right after creation to preserve that
 * long-standing contract. Tests that specifically want to observe the
 * trigger's effect should insert via `prisma.user.create()` directly
 * instead of this helper (see tests/integration/database/user-provisioning-trigger.int.spec.ts).
 */
export async function createTestUser(input: CreateTestUserInput = {}) {
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const user = await prisma.user.create({
    data: {
      name: input.name ?? 'Test User',
      email: input.email ?? `test-${unique}@example.com`,
      passwordHash: input.passwordHash ?? 'hashed-password',
    },
  });

  await prisma.expenseCategory.deleteMany({ where: { userId: user.id } });
  await prisma.wallet.deleteMany({ where: { userId: user.id } });

  return user;
}
