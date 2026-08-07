import { GetCurrentUserUseCase } from '@/modules/auth/application/use-cases/get-current-user.use-case';
import { User } from '@/modules/auth/domain/entities/user.entity';
import { UserNotFoundError } from '@/modules/auth/domain/errors/user-not-found.error';
import { Email } from '@/modules/auth/domain/value-objects/email.vo';

import { InMemoryUserRepository } from './fakes/in-memory-user.repository';

describe('GetCurrentUserUseCase', () => {
  function makeUser(): User {
    return User.create({
      id: 'user-1',
      name: 'Wallison',
      email: Email.create('wallison@email.com'),
      passwordHash: 'hashed-password',
      createdAt: new Date('2026-03-19T10:00:00.000Z'),
      updatedAt: new Date('2026-03-19T10:00:00.000Z'),
    });
  }

  function makeSut(users: User[] = []) {
    const userRepository = new InMemoryUserRepository(users);
    const useCase = new GetCurrentUserUseCase(userRepository);

    return { useCase, userRepository };
  }

  it('should return the basic data of the authenticated user', async () => {
    const { useCase } = makeSut([makeUser()]);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result).toEqual({
      user: {
        id: 'user-1',
        name: 'Wallison',
        email: 'wallison@email.com',
      },
    });
  });

  it('should throw UserNotFoundError with the userId in the message when the user does not exist', async () => {
    const { useCase } = makeSut([]);

    await expect(
      useCase.execute({ userId: 'user-1' }),
    ).rejects.toBeInstanceOf(UserNotFoundError);

    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow(
      'Usuário não encontrado para o id "user-1".',
    );
  });
});
