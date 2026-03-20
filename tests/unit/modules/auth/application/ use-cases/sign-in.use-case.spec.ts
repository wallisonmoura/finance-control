import { SignInUseCase } from '@/modules/auth/application/use-cases/sign-in.use-case';
import { InvalidCredentialsError } from '@/modules/auth/domain/errors/invalid-credentials.error';
import { User } from '@/modules/auth/domain/entities/user.entity';
import { Email } from '@/modules/auth/domain/value-objects/email.vo';

import { InMemoryUserRepository } from './fakes/in-memory-user.repository';
import { FakePasswordHasher } from './fakes/fake-password-hasher';
import { FakeTokenService } from './fakes/fake-token.service';

describe('SignInUseCase', () => {
  function makeSut(users: User[] = []) {
    const userRepository = new InMemoryUserRepository(users);
    const passwordHasher = new FakePasswordHasher();
    const tokenService = new FakeTokenService();

    const useCase = new SignInUseCase(
      userRepository,
      passwordHasher,
      tokenService,
    );

    return {
      useCase,
      userRepository,
      passwordHasher,
      tokenService,
    };
  }

  function makeUser(): User {
    return new User({
      id: 'user-1',
      name: 'Wallison',
      email: Email.create('wallison@email.com'),
      passwordHash: '123456',
      createdAt: new Date('2026-03-19T10:00:00.000Z'),
      updatedAt: new Date('2026-03-19T10:00:00.000Z'),
    });
  }

  it('should authenticate user with valid credentials', async () => {
    const user = makeUser();
    const { useCase } = makeSut([user]);

    const result = await useCase.execute({
      email: 'wallison@email.com',
      password: '123456',
    });

    expect(result).toEqual({
      accessToken: 'token-user-1',
      user: {
        id: 'user-1',
        name: 'Wallison',
        email: 'wallison@email.com',
      },
    });
  });

  it('should normalize email before searching user', async () => {
    const user = makeUser();
    const { useCase } = makeSut([user]);

    const result = await useCase.execute({
      email: '  WALLISON@EMAIL.COM  ',
      password: '123456',
    });

    expect(result.user.email).toBe('wallison@email.com');
    expect(result.accessToken).toBe('token-user-1');
  });

  it('should throw InvalidCredentialsError when user does not exist', async () => {
    const { useCase } = makeSut([]);

    await expect(
      useCase.execute({
        email: 'naoexiste@email.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('should throw InvalidCredentialsError when password is invalid', async () => {
    const user = makeUser();
    const { useCase } = makeSut([user]);

    await expect(
      useCase.execute({
        email: 'wallison@email.com',
        password: 'senha-errada',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('should throw an error when email format is invalid', async () => {
    const user = makeUser();
    const { useCase } = makeSut([user]);

    await expect(
      useCase.execute({
        email: 'email-invalido',
        password: '123456',
      }),
    ).rejects.toThrow('Invalid email');
  });

  it('should return basic authenticated user data only', async () => {
    const user = makeUser();
    const { useCase } = makeSut([user]);

    const result = await useCase.execute({
      email: 'wallison@email.com',
      password: '123456',
    });

    expect(result.user).toEqual({
      id: 'user-1',
      name: 'Wallison',
      email: 'wallison@email.com',
    });

    expect(result.user).not.toHaveProperty('passwordHash');
  });
});
