import { EmailAlreadyInUseError } from '../../domain/errors/email-already-in-use.error';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasher } from '../../domain/services/password-hasher.port';
import { TokenService } from '../../domain/services/token.port';
import { Email } from '../../domain/value-objects/email.vo';
import { SignUpInput } from '../dtos/sign-up.input';
import { SignUpOutput } from '../dtos/sign-up.output';

export class SignUpUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  public async execute(input: SignUpInput): Promise<SignUpOutput> {
    const email = Email.create(input.email);

    const existingUser = await this.userRepository.findByEmail(
      email.getValue(),
    );

    if (existingUser) {
      throw new EmailAlreadyInUseError();
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = await this.userRepository.create({
      name: input.name,
      email: email.getValue(),
      passwordHash,
    });

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
