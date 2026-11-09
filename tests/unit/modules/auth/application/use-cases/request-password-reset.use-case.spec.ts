import { RequestPasswordResetUseCase } from '@/modules/auth/application/use-cases/request-password-reset.use-case';
import { User } from '@/modules/auth/domain/entities/user.entity';
import { Email } from '@/modules/auth/domain/value-objects/email.vo';

import { FakePasswordResetMailer } from './fakes/fake-password-reset-mailer';
import { FakeResetToken } from './fakes/fake-reset-token';
import { InMemoryPasswordResetTokenRepository } from './fakes/in-memory-password-reset-token.repository';
import { InMemoryUserRepository } from './fakes/in-memory-user.repository';

const NOW = new Date('2026-11-08T12:00:00.000Z');
const BASE_URL = 'https://app.example.com';

function makeUser(): User {
  return User.create({
    id: 'user-1',
    name: 'Ana',
    email: Email.create('ana@example.com'),
    passwordHash: 'hash',
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function makeSut(users: User[] = [makeUser()]) {
  const tokens = new InMemoryPasswordResetTokenRepository(() => NOW);
  const mailer = new FakePasswordResetMailer();
  const useCase = new RequestPasswordResetUseCase(
    new InMemoryUserRepository(users),
    tokens,
    new FakeResetToken(),
    mailer,
    BASE_URL,
    () => NOW,
  );

  return { useCase, tokens, mailer };
}

describe('RequestPasswordResetUseCase', () => {
  it('should send a link with a fresh token to an existing account', async () => {
    const { useCase, tokens, mailer } = makeSut();

    await useCase.execute({ email: 'ana@example.com' });

    expect(mailer.sent).toEqual([
      {
        to: 'ana@example.com',
        name: 'Ana',
        resetUrl: 'https://app.example.com/reset-password?token=token-1',
      },
    ]);
    // Only the hash is stored, valid for 60 minutes.
    expect(tokens.tokens).toEqual([
      expect.objectContaining({
        userId: 'user-1',
        tokenHash: 'hashed:token-1',
        expiresAt: new Date('2026-11-08T13:00:00.000Z'),
      }),
    ]);
  });

  it('should do nothing for an unknown email', async () => {
    const { useCase, tokens, mailer } = makeSut();

    await useCase.execute({ email: 'nobody@example.com' });

    expect(mailer.sent).toHaveLength(0);
    expect(tokens.tokens).toHaveLength(0);
  });

  it('should find the account by the normalized email', async () => {
    const { useCase, mailer } = makeSut();

    await useCase.execute({ email: '  Ana@Example.COM ' });

    expect(mailer.sent).toHaveLength(1);
  });

  it('should invalidate the previous pending link before creating a new one', async () => {
    const { useCase, tokens } = makeSut();

    await useCase.execute({ email: 'ana@example.com' });
    await useCase.execute({ email: 'ana@example.com' });

    expect(tokens.tokens.map((token) => token.usedAt)).toEqual([NOW, null]);
  });

  it('should silently skip the 4th request within an hour', async () => {
    const { useCase, tokens, mailer } = makeSut();

    for (let i = 0; i < 4; i += 1) {
      await useCase.execute({ email: 'ana@example.com' });
    }

    expect(mailer.sent).toHaveLength(3);
    expect(tokens.tokens).toHaveLength(3);
    // The 3rd link is still usable: a skipped request changes nothing.
    expect(tokens.tokens[2].usedAt).toBeNull();
  });
});
