// jose is pure ESM and does not load under Jest; the token itself is not what
// these tests check.
jest.mock('@/modules/auth/infra/services/jose-jwt-token.adapter', () => ({
  JoseJwtTokenAdapter: jest.fn().mockImplementation(() => ({
    generateAccessToken: jest.fn().mockResolvedValue('new-token'),
  })),
}));

import { makeChangePasswordUseCase } from '@/modules/auth/infra/factories/make-change-password-use-case';
import { PrismaPasswordResetTokenRepository } from '@/modules/auth/infra/repositories/prisma-password-reset-token.repository';
import { prisma } from '@/shared/infra/database/prisma/client';
import { hash } from 'bcryptjs';
import { createTestUser } from '../../../../helpers/database/create-test-user';

describe('ChangePasswordUseCase (database)', () => {
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

  // Changing the password and dropping pending reset links happen together:
  // otherwise the user sees an error after a change that did happen.
  it('should keep the old password when dropping the pending links fails', async () => {
    const oldHash = await hash('senha-atual-123', 4);
    const user = await createTestUser({ passwordHash: oldHash });
    jest
      .spyOn(PrismaPasswordResetTokenRepository.prototype, 'invalidatePending')
      .mockRejectedValueOnce(new Error('db down'));

    await expect(
      makeChangePasswordUseCase().execute({
        userId: user.id,
        currentPassword: 'senha-atual-123',
        newPassword: 'nova-senha-123',
      }),
    ).rejects.toThrow('db down');

    const stored = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(stored.passwordHash).toBe(oldHash);
  });

  it('should save passwordChangedAt when changing in Account', async () => {
    const user = await createTestUser({ passwordHash: await hash('senha-atual-123', 4) });
    const before = Date.now();

    const output = await makeChangePasswordUseCase().execute({
      userId: user.id,
      currentPassword: 'senha-atual-123',
      newPassword: 'nova-senha-123',
    });

    const stored = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(output).toEqual({ accessToken: 'new-token' });
    expect(stored.passwordChangedAt?.getTime()).toBeGreaterThanOrEqual(before);
  });
});
