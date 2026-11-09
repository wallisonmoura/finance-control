import { InvalidPasswordResetTokenError } from '@/modules/auth/domain/errors/invalid-password-reset-token.error';
import { makeResetPasswordUseCase } from '@/modules/auth/infra/factories/make-reset-password-use-case';
import { PrismaUserRepository } from '@/modules/auth/infra/repositories/prisma-user.repository';
import { CryptoResetTokenAdapter } from '@/modules/auth/infra/services/crypto-reset-token.adapter';
import { prisma } from '@/shared/infra/database/prisma/client';
import { createTestUser } from '../../../../helpers/database/create-test-user';

const resetToken = new CryptoResetTokenAdapter();

async function createLink(userId: string) {
  const { token, tokenHash } = resetToken.generate();
  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });

  return token;
}

async function passwordHashOf(userId: string) {
  return (await prisma.user.findUniqueOrThrow({ where: { id: userId } })).passwordHash;
}

describe('ResetPasswordUseCase (database)', () => {
  const useCase = makeResetPasswordUseCase();

  beforeEach(async () => {
    await prisma.passwordResetToken.deleteMany();
    await prisma.user.deleteMany();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.passwordResetToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should change the password only once when the same link is sent twice at the same time', async () => {
    const user = await createTestUser({ passwordHash: 'old-hash' });
    const token = await createLink(user.id);

    const results = await Promise.allSettled([
      useCase.execute({ token, newPassword: 'first-password' }),
      useCase.execute({ token, newPassword: 'second-password' }),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.find((result) => result.status === 'rejected') as PromiseRejectedResult;
    expect(rejected.reason).toBeInstanceOf(InvalidPasswordResetTokenError);
    expect(await passwordHashOf(user.id)).not.toBe('old-hash');
  });

  it("should never change another user's password", async () => {
    const user = await createTestUser({ passwordHash: 'user-hash' });
    const otherUser = await createTestUser({ passwordHash: 'other-hash' });
    const token = await createLink(user.id);

    await useCase.execute({ token, newPassword: 'new-password' });

    expect(await passwordHashOf(user.id)).not.toBe('user-hash');
    expect(await passwordHashOf(otherUser.id)).toBe('other-hash');
  });

  it('should keep the link usable when changing the password fails', async () => {
    const user = await createTestUser({ passwordHash: 'old-hash' });
    const token = await createLink(user.id);
    jest
      .spyOn(PrismaUserRepository.prototype, 'updatePassword')
      .mockRejectedValueOnce(new Error('db down'));

    await expect(useCase.execute({ token, newPassword: 'new-password' })).rejects.toThrow('db down');

    await useCase.execute({ token, newPassword: 'new-password' });
    expect(await passwordHashOf(user.id)).not.toBe('old-hash');
  });
});
