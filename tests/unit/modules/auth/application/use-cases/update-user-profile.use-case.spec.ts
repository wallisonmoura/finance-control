import { UpdateUserProfileUseCase } from '@/modules/auth/application/use-cases/update-user-profile.use-case';
import { InvalidUserNameError } from '@/modules/auth/domain/errors/invalid-user-name.error';
import { UserNotFoundError } from '@/modules/auth/domain/errors/user-not-found.error';
import { User } from '@/modules/auth/domain/entities/user.entity';
import { Email } from '@/modules/auth/domain/value-objects/email.vo';

import { InMemoryUserRepository } from './fakes/in-memory-user.repository';

describe('UpdateUserProfileUseCase', () => {
  function makeSut(users: User[] = []) {
    const userRepository = new InMemoryUserRepository(users);
    const useCase = new UpdateUserProfileUseCase(userRepository);

    return { useCase, userRepository };
  }

  function makeExistingUser(): User {
    return User.create({
      id: 'user-1',
      name: 'Wallison',
      email: Email.create('wallison@email.com'),
      passwordHash: 'hashed-123456',
      createdAt: new Date('2026-03-19T10:00:00.000Z'),
      updatedAt: new Date('2026-03-19T10:00:00.000Z'),
    });
  }

  it('should update the user name and return the updated user', async () => {
    const { useCase } = makeSut([makeExistingUser()]);

    const result = await useCase.execute({
      userId: 'user-1',
      name: 'Wallison Moura',
    });

    expect(result.user).toEqual({
      id: 'user-1',
      name: 'Wallison Moura',
      email: 'wallison@email.com',
    });
  });

  it('should persist the updated name', async () => {
    const { useCase, userRepository } = makeSut([makeExistingUser()]);

    await useCase.execute({ userId: 'user-1', name: 'Wallison Moura' });

    const persisted = await userRepository.findById('user-1');

    expect(persisted?.name).toBe('Wallison Moura');
  });

  it('should throw UserNotFoundError when the user does not exist', async () => {
    const { useCase } = makeSut([]);

    await expect(
      useCase.execute({ userId: 'user-1', name: 'Wallison Moura' }),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('should throw InvalidUserNameError when the name is empty', async () => {
    const { useCase } = makeSut([makeExistingUser()]);

    await expect(
      useCase.execute({ userId: 'user-1', name: '   ' }),
    ).rejects.toBeInstanceOf(InvalidUserNameError);
  });
});
