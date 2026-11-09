import { ChangePasswordUseCase } from '@/modules/auth/application/use-cases/change-password.use-case';
import { InvalidCredentialsError } from '@/modules/auth/domain/errors/invalid-credentials.error';
import { UserNotFoundError } from '@/modules/auth/domain/errors/user-not-found.error';
import { User } from '@/modules/auth/domain/entities/user.entity';
import { Email } from '@/modules/auth/domain/value-objects/email.vo';

import { InMemoryUserRepository } from './fakes/in-memory-user.repository';
import { FakePasswordHasher } from './fakes/fake-password-hasher';
import { InMemoryPasswordResetTokenRepository } from './fakes/in-memory-password-reset-token.repository';

describe('ChangePasswordUseCase', () => {
  function makeSut(users: User[] = []) {
    const userRepository = new InMemoryUserRepository(users);
    const passwordHasher = new FakePasswordHasher();
    const tokenRepository = new InMemoryPasswordResetTokenRepository();
    const useCase = new ChangePasswordUseCase(userRepository, passwordHasher, tokenRepository);

    return { useCase, userRepository, passwordHasher, tokenRepository };
  }

  function makeExistingUser(): User {
    return User.create({
      id: 'user-1',
      name: 'Wallison',
      email: Email.create('wallison@email.com'),
      passwordHash: 'current-password',
      createdAt: new Date('2026-03-19T10:00:00.000Z'),
      updatedAt: new Date('2026-03-19T10:00:00.000Z'),
    });
  }

  it('should hash and persist the new password when the current password matches', async () => {
    const { useCase, userRepository } = makeSut([makeExistingUser()]);

    await useCase.execute({
      userId: 'user-1',
      currentPassword: 'current-password',
      newPassword: 'new-password-123',
    });

    const persisted = await userRepository.findById('user-1');

    expect(persisted?.passwordHash).toBe('hashed-new-password-123');
  });

  // A reset link asked before the change must not undo it later.
  it('should invalidate pending reset links after changing the password', async () => {
    const { useCase, tokenRepository } = makeSut([makeExistingUser()]);
    await tokenRepository.create({
      userId: 'user-1',
      tokenHash: 'hashed:link',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    await useCase.execute({
      userId: 'user-1',
      currentPassword: 'current-password',
      newPassword: 'new-password-123',
    });

    expect(await tokenRepository.consume('hashed:link', new Date())).toBeNull();
  });

  it('should throw InvalidCredentialsError when the current password does not match', async () => {
    const { useCase } = makeSut([makeExistingUser()]);

    await expect(
      useCase.execute({
        userId: 'user-1',
        currentPassword: 'wrong-password',
        newPassword: 'new-password-123',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('should not change the password when the current password does not match', async () => {
    const { useCase, userRepository } = makeSut([makeExistingUser()]);

    await expect(
      useCase.execute({
        userId: 'user-1',
        currentPassword: 'wrong-password',
        newPassword: 'new-password-123',
      }),
    ).rejects.toThrow();

    const persisted = await userRepository.findById('user-1');

    expect(persisted?.passwordHash).toBe('current-password');
  });

  it('should throw UserNotFoundError when the user does not exist', async () => {
    const { useCase } = makeSut([]);

    await expect(
      useCase.execute({
        userId: 'user-1',
        currentPassword: 'current-password',
        newPassword: 'new-password-123',
      }),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });
});
