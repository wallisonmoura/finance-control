import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasherPort } from '../../domain/services/password-hasher.port';
import { TokenPort } from '../../domain/services/token.port';
import { ChangePasswordInput } from '../dtos/change-password.input';
import { ChangePasswordOutput } from '../dtos/change-password.output';

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenRepository: PasswordResetTokenRepository,
    private readonly tokenService: TokenPort,
    private readonly now: () => Date = () => new Date(),
  ) {}

  public async execute(input: ChangePasswordInput): Promise<ChangePasswordOutput> {
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

    // Issued after the change, so it is not signed out by it.
    const accessToken = await this.tokenService.generateAccessToken({
      sub: existingUser.id,
      email: existingUser.email.getValue(),
    });

    return { accessToken };
  }
}
