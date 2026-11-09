import { PrismaPasswordResetTokenRepository } from '@/modules/auth/infra/repositories/prisma-password-reset-token.repository';
import { prisma } from '@/shared/infra/database/prisma/client';
import { createTestUser } from '../../../../../helpers/database/create-test-user';

const NOW = new Date('2026-11-08T12:00:00.000Z');
const IN_ONE_HOUR = new Date('2026-11-08T13:00:00.000Z');

describe('PrismaPasswordResetTokenRepository', () => {
  const repository = new PrismaPasswordResetTokenRepository();

  beforeEach(async () => {
    await prisma.passwordResetToken.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.passwordResetToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should consume a valid token once and return its user', async () => {
    const user = await createTestUser();
    await repository.create({ userId: user.id, tokenHash: 'hash-a', expiresAt: IN_ONE_HOUR });

    expect(await repository.consume('hash-a', NOW)).toBe(user.id);
    expect(await repository.consume('hash-a', NOW)).toBeNull();
  });

  it('should not consume an expired token', async () => {
    const user = await createTestUser();
    await repository.create({ userId: user.id, tokenHash: 'hash-a', expiresAt: NOW });

    expect(await repository.consume('hash-a', NOW)).toBeNull();
  });

  it('should not consume an unknown token', async () => {
    expect(await repository.consume('missing', NOW)).toBeNull();
  });

  it('should not let a token be consumed twice at the same time', async () => {
    const user = await createTestUser();
    await repository.create({ userId: user.id, tokenHash: 'hash-a', expiresAt: IN_ONE_HOUR });

    const results = await Promise.all([
      repository.consume('hash-a', NOW),
      repository.consume('hash-a', NOW),
    ]);

    expect(results.filter((result) => result === user.id)).toHaveLength(1);
    expect(results.filter((result) => result === null)).toHaveLength(1);
  });

  it('should invalidate only the pending tokens of the user', async () => {
    const user = await createTestUser();
    const otherUser = await createTestUser();
    await repository.create({ userId: user.id, tokenHash: 'hash-a', expiresAt: IN_ONE_HOUR });
    await repository.create({ userId: otherUser.id, tokenHash: 'hash-b', expiresAt: IN_ONE_HOUR });

    await repository.invalidatePending(user.id, NOW);

    expect(await repository.consume('hash-a', NOW)).toBeNull();
    expect(await repository.consume('hash-b', NOW)).toBe(otherUser.id);
  });

  it('should count the tokens of a user created since a moment', async () => {
    const user = await createTestUser();
    const otherUser = await createTestUser();
    await repository.create({ userId: user.id, tokenHash: 'hash-a', expiresAt: IN_ONE_HOUR });
    await repository.create({ userId: user.id, tokenHash: 'hash-b', expiresAt: IN_ONE_HOUR });
    await repository.create({ userId: otherUser.id, tokenHash: 'hash-c', expiresAt: IN_ONE_HOUR });

    const anHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    expect(await repository.countCreatedSince(user.id, anHourAgo)).toBe(2);
    expect(await repository.countCreatedSince(user.id, new Date(Date.now() + 60_000))).toBe(0);
  });
});
