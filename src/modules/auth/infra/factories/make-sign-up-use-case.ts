import { SignUpUseCase } from '../../application/use-cases/sign-up.use-case';
import { AUTH_JWT_EXPIRES_IN } from '../../constants/auth.constants';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { BcryptPasswordHasherAdapter } from '../services/bcrypt-password-hasher.adapter';
import { JoseJwtTokenAdapter } from '../services/jose-jwt-token.adapter';

export function makeSignUpUseCase() {
  const userRepository = new PrismaUserRepository();
  const passwordHasher = new BcryptPasswordHasherAdapter();
  const tokenService = new JoseJwtTokenAdapter(
    process.env.JWT_SECRET!,
    AUTH_JWT_EXPIRES_IN,
  );

  return new SignUpUseCase(userRepository, passwordHasher, tokenService);
}
