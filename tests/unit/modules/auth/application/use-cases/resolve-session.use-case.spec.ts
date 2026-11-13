import { ResolveSessionUseCase } from '@/modules/auth/application/use-cases/resolve-session.use-case';
import { User } from '@/modules/auth/domain/entities/user.entity';
import { Email } from '@/modules/auth/domain/value-objects/email.vo';

import { FakeTokenService } from './fakes/fake-token.service';
import { InMemoryUserRepository } from './fakes/in-memory-user.repository';

const CHANGED_AT = new Date('2026-11-12T12:00:00.999Z');
const CHANGED_AT_SECOND = Math.floor(Date.parse('2026-11-12T12:00:00.000Z') / 1000);

function makeUser(passwordChangedAt: Date | null = null) {
  return User.create({
    id: 'user-1',
    name: 'Ana',
    email: Email.create('ana@example.com'),
    passwordHash: 'hash',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    passwordChangedAt,
  });
}

function makeSut(users: User[], issuedAt = CHANGED_AT_SECOND) {
  const userRepository = new InMemoryUserRepository(users);
  const useCase = new ResolveSessionUseCase(new FakeTokenService(() => issuedAt), userRepository);

  return { useCase, userRepository };
}

describe('ResolveSessionUseCase', () => {
  it('should return the user id for a valid session', async () => {
    const { useCase } = makeSut([makeUser(CHANGED_AT)], CHANGED_AT_SECOND + 10);

    await expect(useCase.execute('token-user-1')).resolves.toBe('user-1');
  });

  it('should return null for an invalid token', async () => {
    const { useCase } = makeSut([makeUser()]);

    await expect(useCase.execute('not-a-token')).resolves.toBeNull();
  });

  it('should return null when the user no longer exists', async () => {
    const { useCase } = makeSut([]);

    await expect(useCase.execute('token-user-1')).resolves.toBeNull();
  });

  it('should return null for a session issued before the password change', async () => {
    const { useCase } = makeSut([makeUser(CHANGED_AT)], CHANGED_AT_SECOND - 1);

    await expect(useCase.execute('token-user-1')).resolves.toBeNull();
  });

  // The login issued with the change in Account lands in the same second.
  it('should accept a session issued in the same second as the password change', async () => {
    const { useCase } = makeSut([makeUser(CHANGED_AT)], CHANGED_AT_SECOND);

    await expect(useCase.execute('token-user-1')).resolves.toBe('user-1');
  });

  it('should keep a user who never changed the password signed in', async () => {
    const { useCase } = makeSut([makeUser(null)], 0);

    await expect(useCase.execute('token-user-1')).resolves.toBe('user-1');
  });

  // A database outage must not look like a sign-out.
  it('should propagate a repository failure instead of signing out', async () => {
    const { useCase, userRepository } = makeSut([makeUser()]);
    jest.spyOn(userRepository, 'findById').mockRejectedValue(new Error('db down'));

    await expect(useCase.execute('token-user-1')).rejects.toThrow('db down');
  });
});
