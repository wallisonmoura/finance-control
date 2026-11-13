import { InvalidPasswordResetTokenError } from '../../domain/errors/invalid-password-reset-token.error';
import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasherPort } from '../../domain/services/password-hasher.port';
import { ResetTokenPort } from '../../domain/services/reset-token.port';
import { ResetPasswordInput } from '../dtos/reset-password.input';

// Sets a new password from a reset link. Runs inside one transaction (see
// makeResetPasswordUseCase): using the link, changing the password and
// invalidating the other links happen together or not at all. Does not log in.
export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: PasswordResetTokenRepository,
    private readonly resetToken: ResetTokenPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    const now = this.now();
    const userId = await this.tokenRepository.consume(this.resetToken.hash(input.token), now);

    if (!userId) {
      throw new InvalidPasswordResetTokenError();
    }

    const passwordHash = await this.passwordHasher.hash(input.newPassword);

    await this.userRepository.updatePassword(userId, passwordHash, now);
    await this.tokenRepository.invalidatePending(userId, now);
  }
}
