import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';

export function makeUpdateUserProfileUseCase() {
  const userRepository = new PrismaUserRepository();

  return new UpdateUserProfileUseCase(userRepository);
}
