import { ResetPasswordUseCase } from '@/modules/auth/application/use-cases/reset-password.use-case';
import { User } from '@/modules/auth/domain/entities/user.entity';
import { InvalidPasswordResetTokenError } from '@/modules/auth/domain/errors/invalid-password-reset-token.error';
import { Email } from '@/modules/auth/domain/value-objects/email.vo';

import { FakePasswordHasher } from './fakes/fake-password-hasher';
import { FakeResetToken } from './fakes/fake-reset-token';
import { InMemoryPasswordResetTokenRepository } from './fakes/in-memory-password-reset-token.repository';
import { InMemoryUserRepository } from './fakes/in-memory-user.repository';

const NOW = new Date('2026-11-08T12:00:00.000Z');
const LATER = new Date('2026-11-08T13:00:00.000Z');

function makeSut() {
  const users = new InMemoryUserRepository([
    User.create({
      id: 'user-1',
      name: 'Ana',
      email: Email.create('ana@example.com'),
      passwordHash: 'old-hash',
      createdAt: NOW,
      updatedAt: NOW,
    }),
  ]);
  const tokens = new InMemoryPasswordResetTokenRepository(() => NOW);
  const useCase = new ResetPasswordUseCase(
    users,
    tokens,
    new FakeResetToken(),
    new FakePasswordHasher(),
    () => NOW,
  );

  return { useCase, users, tokens };
}

describe('ResetPasswordUseCase', () => {
  it('should change the password and invalidate the other pending links', async () => {
    const { useCase, users, tokens } = makeSut();
    await tokens.create({ userId: 'user-1', tokenHash: 'hashed:link', expiresAt: LATER });
    await tokens.create({ userId: 'user-1', tokenHash: 'hashed:other', expiresAt: LATER });

    await useCase.execute({ token: 'link', newPassword: 'new-password' });

    expect((await users.findById('user-1'))?.passwordHash).toBe('hashed-new-password');
    expect(tokens.tokens.every((token) => token.usedAt !== null)).toBe(true);
  });

  // Signs out every device: logins issued before this moment stop working.
  it('should record the password change moment', async () => {
    const { useCase, users, tokens } = makeSut();
    await tokens.create({ userId: 'user-1', tokenHash: 'hashed:link', expiresAt: LATER });

    await useCase.execute({ token: 'link', newPassword: 'new-password' });

    expect((await users.findById('user-1'))?.passwordChangedAt).toEqual(NOW);
  });

  it('should refuse an unknown token', async () => {
    const { useCase, users } = makeSut();

    await expect(
      useCase.execute({ token: 'missing', newPassword: 'new-password' }),
    ).rejects.toThrow(new InvalidPasswordResetTokenError());
    expect((await users.findById('user-1'))?.passwordHash).toBe('old-hash');
  });

  it('should refuse an expired token', async () => {
    const { useCase, tokens } = makeSut();
    await tokens.create({ userId: 'user-1', tokenHash: 'hashed:link', expiresAt: NOW });

    await expect(
      useCase.execute({ token: 'link', newPassword: 'new-password' }),
    ).rejects.toBeInstanceOf(InvalidPasswordResetTokenError);
  });

  it('should refuse a token already used', async () => {
    const { useCase, tokens } = makeSut();
    await tokens.create({ userId: 'user-1', tokenHash: 'hashed:link', expiresAt: LATER });
    await useCase.execute({ token: 'link', newPassword: 'new-password' });

    await expect(
      useCase.execute({ token: 'link', newPassword: 'another-password' }),
    ).rejects.toBeInstanceOf(InvalidPasswordResetTokenError);
  });

  it('should say the link expired or was already used', () => {
    expect(new InvalidPasswordResetTokenError().message).toBe('Este link expirou ou já foi usado.');
  });
});
