import { SignInUseCase } from '@/modules/auth/application/use-cases/sign-in.use-case';
import { InvalidCredentialsError } from '@/modules/auth/domain/errors/invalid-credentials.error';
import {
  TokenPayload,
  TokenPort,
  VerifiedTokenPayload,
} from '@/modules/auth/domain/services/token.port';
import { PrismaUserRepository } from '@/modules/auth/infra/repositories/prisma-user.repository';
import { BcryptPasswordHasherAdapter } from '@/modules/auth/infra/services/bcrypt-password-hasher.adapter';
import { prisma } from '@/shared/infra/database/prisma/client';
import { hash } from 'bcryptjs';

class FakeTokenService implements TokenPort {
  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return `token-for-${payload.sub}`;
  }

  async verifyAccessToken(token: string): Promise<VerifiedTokenPayload> {
    return {
      sub: token.replace('token-for-', ''),
      email: 'fake@email.com',
      issuedAt: 0,
    };
  }
}

describe('SignInUseCase Integration', () => {
  let signInUseCase: SignInUseCase;

  beforeAll(async () => {
    const userRepository = new PrismaUserRepository();
    const passwordHasher = new BcryptPasswordHasherAdapter();
    const tokenService = new FakeTokenService();

    signInUseCase = new SignInUseCase(
      userRepository,
      passwordHasher,
      tokenService,
    );
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should sign in with valid credentials', async () => {
    const passwordHash = await hash('123456', 10);

    await prisma.user.create({
      data: {
        name: 'Wallison',
        email: 'wallison@email.com',
        passwordHash,
      },
    });

    const output = await signInUseCase.execute({
      email: 'wallison@email.com',
      password: '123456',
    });

    expect(output.accessToken).toMatch(/^token-for-/);
    expect(output.user).toEqual({
      id: expect.any(String),
      name: 'Wallison',
      email: 'wallison@email.com',
    });
  });

  it('should throw InvalidCredentialsError when email does not exist', async () => {
    await expect(
      signInUseCase.execute({
        email: 'naoexiste@email.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('should throw InvalidCredentialsError when password is invalid', async () => {
    const passwordHash = await hash('123456', 10);

    await prisma.user.create({
      data: {
        name: 'Wallison',
        email: 'wallison@email.com',
        passwordHash,
      },
    });

    await expect(
      signInUseCase.execute({
        email: 'wallison@email.com',
        password: 'senha-errada',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
