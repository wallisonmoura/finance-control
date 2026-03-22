import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { UserRepository } from '../../domain/repositories/user.repository';
import { GetCurrentUserInput } from '../dtos/get-current-user.input';
import { GetCurrentUserOutput } from '../dtos/get-current-user.output';

export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: GetCurrentUserInput): Promise<GetCurrentUserOutput> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email.getValue(),
      },
    };
  }
}
