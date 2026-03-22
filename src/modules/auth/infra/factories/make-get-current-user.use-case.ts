import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';

export function makeGetCurrentUserUseCase() {
  const userRepository = new PrismaUserRepository();

  return new GetCurrentUserUseCase(userRepository);
}
