import {
  PASSWORD_RESET_MAX_PER_ACCOUNT_PER_HOUR,
  PASSWORD_RESET_TOKEN_TTL_MINUTES,
} from '../../constants/auth.constants';
import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordResetMailerPort } from '../../domain/services/password-reset-mailer.port';
import { ResetTokenPort } from '../../domain/services/reset-token.port';
import { Email } from '../../domain/value-objects/email.vo';
import { RequestPasswordResetInput } from '../dtos/request-password-reset.input';

const MINUTE_IN_MS = 60 * 1000;

// Sends a password reset link. Never tells the caller whether the account
// exists: an unknown email and a skipped request both end silently.
export class RequestPasswordResetUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: PasswordResetTokenRepository,
    private readonly resetToken: ResetTokenPort,
    private readonly mailer: PasswordResetMailerPort,
    private readonly resetUrlBase: string,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(input: RequestPasswordResetInput): Promise<void> {
    const email = Email.create(input.email);
    const user = await this.userRepository.findByEmail(email.getValue());

    if (!user) {
      return;
    }

    const now = this.now();
    const anHourAgo = new Date(now.getTime() - 60 * MINUTE_IN_MS);
    const recentRequests = await this.tokenRepository.countCreatedSince(user.id, anHourAgo);

    if (recentRequests >= PASSWORD_RESET_MAX_PER_ACCOUNT_PER_HOUR) {
      return;
    }

    await this.tokenRepository.invalidatePending(user.id, now);

    const { token, tokenHash } = this.resetToken.generate();

    await this.tokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(now.getTime() + PASSWORD_RESET_TOKEN_TTL_MINUTES * MINUTE_IN_MS),
    });

    await this.mailer.sendPasswordResetLink({
      to: user.email.getValue(),
      name: user.name,
      resetUrl: `${this.resetUrlBase}/reset-password?token=${encodeURIComponent(token)}`,
    });
  }
}
