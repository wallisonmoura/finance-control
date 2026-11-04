import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { BcryptPasswordHasherAdapter } from '../services/bcrypt-password-hasher.adapter';

export function makeChangePasswordUseCase() {
  const userRepository = new PrismaUserRepository();
  const passwordHasher = new BcryptPasswordHasherAdapter();

  return new ChangePasswordUseCase(userRepository, passwordHasher);
}
