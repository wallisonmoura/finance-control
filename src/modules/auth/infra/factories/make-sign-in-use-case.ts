import { SignInUseCase } from '../../application/use-cases/sign-in.use-case';
import { AUTH_JWT_EXPIRES_IN } from '../../constants/auth.constants';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { BcryptPasswordHasherAdapter } from '../services/bcrypt-password-hasher.adapter';
import { JoseJwtTokenAdapter } from '../services/jose-jwt-token.adapter';

export function makeSignInUseCase() {
  const userRepository = new PrismaUserRepository();
  const passwordhasher = new BcryptPasswordHasherAdapter();
  const tokenService = new JoseJwtTokenAdapter(
    process.env.JWT_SECRET!,
    AUTH_JWT_EXPIRES_IN,
  );

  return new SignInUseCase(userRepository, passwordhasher, tokenService);
}
