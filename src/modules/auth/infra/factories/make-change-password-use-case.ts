import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { BcryptPasswordHasher } from '../services/bcrypt-password-hasher.adapter';

export function makeChangePasswordUseCase() {
  const userRepository = new PrismaUserRepository();
  const passwordHasher = new BcryptPasswordHasher();

  return new ChangePasswordUseCase(userRepository, passwordHasher);
}
