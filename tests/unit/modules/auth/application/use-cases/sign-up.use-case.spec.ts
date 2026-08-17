import { SignUpUseCase } from '@/modules/auth/application/use-cases/sign-up.use-case';
import { EmailAlreadyInUseError } from '@/modules/auth/domain/errors/email-already-in-use.error';
import { User } from '@/modules/auth/domain/entities/user.entity';
import { Email } from '@/modules/auth/domain/value-objects/email.vo';

import { InMemoryUserRepository } from './fakes/in-memory-user.repository';
import { FakePasswordHasher } from './fakes/fake-password-hasher';
import { FakeTokenService } from './fakes/fake-token.service';

describe('SignUpUseCase', () => {
  function makeSut(users: User[] = []) {
    const userRepository = new InMemoryUserRepository(users);
    const passwordHasher = new FakePasswordHasher();
    const tokenService = new FakeTokenService();

    const useCase = new SignUpUseCase(
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

  it('should register a new user and return an access token', async () => {
    const { useCase } = makeSut([]);

    const result = await useCase.execute({
      name: 'Nova Usuária',
      email: 'nova@email.com',
      password: '12345678',
    });

    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.user).toEqual({
      id: expect.any(String),
      name: 'Nova Usuária',
      email: 'nova@email.com',
    });
  });

  it('should hash the password via the PasswordHasher port instead of storing it raw', async () => {
    const { useCase, userRepository } = makeSut([]);

    const result = await useCase.execute({
      name: 'Nova Usuária',
      email: 'nova@email.com',
      password: '12345678',
    });

    const persisted = await userRepository.findById(result.user.id);

    expect(persisted?.passwordHash).toBe('hashed-12345678');
    expect(persisted?.passwordHash).not.toBe('12345678');
  });

  it('should normalize the email before persisting', async () => {
    const { useCase } = makeSut([]);

    const result = await useCase.execute({
      name: 'Nova Usuária',
      email: '  NOVA@EMAIL.COM  ',
      password: '12345678',
    });

    expect(result.user.email).toBe('nova@email.com');
  });

  it('should throw EmailAlreadyInUseError when the email is already registered', async () => {
    const existingUser = makeExistingUser();
    const { useCase } = makeSut([existingUser]);

    await expect(
      useCase.execute({
        name: 'Outro Usuário',
        email: 'wallison@email.com',
        password: '12345678',
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseError);
  });

  it('should throw an error when email format is invalid', async () => {
    const { useCase } = makeSut([]);

    await expect(
      useCase.execute({
        name: 'Nova Usuária',
        email: 'email-invalido',
        password: '12345678',
      }),
    ).rejects.toThrow('E-mail inválido.');
  });
});
