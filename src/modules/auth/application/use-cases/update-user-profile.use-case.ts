import { User } from '../../domain/entities/user.entity';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UpdateUserProfileInput } from '../dtos/update-user-profile.input';
import { UpdateUserProfileOutput } from '../dtos/update-user-profile.output';

export class UpdateUserProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  public async execute(
    input: UpdateUserProfileInput,
  ): Promise<UpdateUserProfileOutput> {
    const existingUser = await this.userRepository.findById(input.userId);

    if (!existingUser) {
      throw new UserNotFoundError(input.userId);
    }

    // Reuses User.create()'s own validation (InvalidUserNameError) instead
    // of duplicating the empty-name check here.
    User.create({
      id: existingUser.id,
      name: input.name,
      email: existingUser.email,
      passwordHash: existingUser.passwordHash,
      createdAt: existingUser.createdAt,
      updatedAt: existingUser.updatedAt,
    });

    const updatedUser = await this.userRepository.updateName(
      input.userId,
      input.name,
    );

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email.getValue(),
      },
    };
  }
}
