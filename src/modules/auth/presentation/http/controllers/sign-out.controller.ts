import { SignOutUseCase } from '@/modules/auth/application/use-cases/sign-out.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

export type SignOutResponseBody = {
  message: string;
};

export class SignOutController implements Controller<
  HttpRequest,
  SignOutResponseBody
> {
  constructor(private readonly signOutUseCase: SignOutUseCase) {}

  async handle(): Promise<HttpResponse<SignOutResponseBody>> {
    await this.signOutUseCase.execute();

    return {
      statusCode: 200,
      body: { message: 'Signed out successfully' },
    };
  }
}
