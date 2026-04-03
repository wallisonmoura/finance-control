import { prisma } from '@/shared/infra/database/prisma/client';

type CreateTestUserInput = {
  name?: string;
  email?: string;
  passwordHash?: string;
};

export async function createTestUser(input: CreateTestUserInput = {}) {
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return prisma.user.create({
    data: {
      name: input.name ?? 'Test User',
      email: input.email ?? `test-${unique}@example.com`,
      passwordHash: input.passwordHash ?? 'hashed-password',
    },
  });
}
