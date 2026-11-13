import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasherPort } from '../../domain/services/password-hasher.port';
import { ChangePasswordInput } from '../dtos/change-password.input';

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenRepository: PasswordResetTokenRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  public async execute(input: ChangePasswordInput): Promise<void> {
    const existingUser = await this.userRepository.findById(input.userId);

    if (!existingUser) {
      throw new UserNotFoundError(input.userId);
    }

    const isCurrentPasswordValid = await this.passwordHasher.compare(
      input.currentPassword,
      existingUser.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const newPasswordHash = await this.passwordHasher.hash(input.newPassword);

    const now = this.now();

    await this.userRepository.updatePassword(input.userId, newPasswordHash, now);
    // A reset link asked before this change must not undo it later.
    await this.tokenRepository.invalidatePending(input.userId, now);
  }
}
