import { SignInUseCase } from '../../application/use-cases/sign-in.use-case';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { BcryptPasswordHasher } from '../services/bcrypt-password-hasher.adapter';
import { JoseJwtTokenService } from '../services/jose-jwt-token.adapter';

export function makeSignInUseCase() {
  const userRepository = new PrismaUserRepository();
  const passwordhasher = new BcryptPasswordHasher();
  const tokenService = new JoseJwtTokenService(
    process.env.JWT_SECRET!,
    process.env.JWT_EXPIRES_IN ?? '7d',
  );

  return new SignInUseCase(userRepository, passwordhasher, tokenService);
}
