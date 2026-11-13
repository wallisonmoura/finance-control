// jose is pure ESM and does not load under Jest. This stand-in keeps what the
// session check relies on: the token carries its user and its issue second.
jest.mock('@/modules/auth/infra/services/jose-jwt-token.adapter', () => ({
  JoseJwtTokenAdapter: jest.fn().mockImplementation(() => ({
    generateAccessToken: async ({ sub }: { sub: string }) =>
      `token:${sub}:${Math.floor(Date.now() / 1000)}`,
    verifyAccessToken: async (token: string) => {
      const [, sub, issuedAt] = token.split(':');
      return { sub, email: 'fake@email.com', issuedAt: Number(issuedAt) };
    },
  })),
}));

import { hash } from 'bcryptjs';

import { makeChangePasswordUseCase } from '@/modules/auth/infra/factories/make-change-password-use-case';
import { makeResetPasswordUseCase } from '@/modules/auth/infra/factories/make-reset-password-use-case';
import { makeResolveSessionUseCase } from '@/modules/auth/infra/factories/make-resolve-session-use-case';
import { CryptoResetTokenAdapter } from '@/modules/auth/infra/services/crypto-reset-token.adapter';
import { prisma } from '@/shared/infra/database/prisma/client';
import { createTestUser } from '../../../../helpers/database/create-test-user';

// A login issued one second ago, before any change made by the test.
function previousLoginOf(userId: string) {
  return `token:${userId}:${Math.floor(Date.now() / 1000) - 1}`;
}

describe('ResolveSessionUseCase (database)', () => {
  const resolveSession = makeResolveSessionUseCase();

  beforeEach(async () => {
    await prisma.passwordResetToken.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.passwordResetToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should sign out every device after a password reset', async () => {
    const user = await createTestUser();
    const phone = previousLoginOf(user.id);
    const laptop = previousLoginOf(user.id);
    const { token, tokenHash } = new CryptoResetTokenAdapter().generate();
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });

    expect(await resolveSession.execute(phone)).toBe(user.id);

    await makeResetPasswordUseCase().execute({ token, newPassword: 'nova-senha-123' });

    expect(await resolveSession.execute(phone)).toBeNull();
    expect(await resolveSession.execute(laptop)).toBeNull();
  });

  it('should keep only the current device after changing the password in Account', async () => {
    const user = await createTestUser({ passwordHash: await hash('senha-atual-123', 4) });
    const otherDevice = previousLoginOf(user.id);

    const { accessToken } = await makeChangePasswordUseCase().execute({
      userId: user.id,
      currentPassword: 'senha-atual-123',
      newPassword: 'nova-senha-123',
    });

    expect(await resolveSession.execute(otherDevice)).toBeNull();
    expect(await resolveSession.execute(accessToken)).toBe(user.id);
  });

  it("should not affect another user's session", async () => {
    const changer = await createTestUser({ passwordHash: await hash('senha-atual-123', 4) });
    const other = await createTestUser();
    const otherLogin = previousLoginOf(other.id);

    await makeChangePasswordUseCase().execute({
      userId: changer.id,
      currentPassword: 'senha-atual-123',
      newPassword: 'nova-senha-123',
    });

    expect(await resolveSession.execute(otherLogin)).toBe(other.id);
  });
});
