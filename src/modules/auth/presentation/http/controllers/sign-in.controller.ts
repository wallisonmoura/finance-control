import { SignInInput } from '@/modules/auth/application/dtos/sign-in.input';
import { SignInOutput } from '@/modules/auth/application/dtos/sign-in.output';
import { SignInUseCase } from '@/modules/auth/application/use-cases/sign-in.use-case';

export class SignInController {
  constructor(private readonly SignInUseCase: SignInUseCase) {}

  async handle(input: SignInInput): Promise<SignInOutput> {
    return this.SignInUseCase.execute(input);
  }
}
