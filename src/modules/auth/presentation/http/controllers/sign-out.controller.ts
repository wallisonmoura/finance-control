import { SignOutUseCase } from '@/modules/auth/application/use-cases/sign-out.use-case';

export class SignOutController {
  constructor(private readonly signOutUseCase: SignOutUseCase) {}

  async handle(): Promise<void> {
    await this.signOutUseCase.execute();
  }
}
