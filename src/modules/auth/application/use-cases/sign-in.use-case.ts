import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasher } from '../../domain/services/password-hasher.port';
import { TokenService } from '../../domain/services/token.port';
import { Email } from '../../domain/value-objects/email.vo';
import { SignInInput } from '../dtos/sign-in.input';
import { SignInOutput } from '../dtos/sign-in.output';

export class SignInUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  public async execute(input: SignInInput): Promise<SignInOutput> {
    const email = Email.create(input.email);

    const user = await this.userRepository.findByEmail(email.getValue());

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const accessToken = await this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email.getValue(),
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email.getValue(),
      },
    };
  }
}
