import { UserRepository } from '../../domain/repositories/user.repository';
import { TokenPort } from '../../domain/services/token.port';

// The only way from the login cookie to a user id. A login stops being valid
// when it is expired or tampered with, when its user no longer exists, or when
// it was issued before the last password change (every other device signs out).
export class ResolveSessionUseCase {
  constructor(
    private readonly tokenService: TokenPort,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(token: string): Promise<string | null> {
    let payload;

    try {
      payload = await this.tokenService.verifyAccessToken(token);
    } catch {
      return null;
    }

    // Not caught: a database failure is an error, not a sign-out.
    const user = await this.userRepository.findById(payload.sub);

    if (!user || !user.acceptsSessionIssuedAt(payload.issuedAt)) {
      return null;
    }

    return user.id;
  }
}
