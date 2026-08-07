import { SignInInput } from '@/modules/auth/application/dtos/sign-in.input';
import { SignInOutput } from '@/modules/auth/application/dtos/sign-in.output';
import { SignInUseCase } from '@/modules/auth/application/use-cases/sign-in.use-case';
import { signInSchema } from '@/modules/auth/presentation/http/schemas/sign-in.schema';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

export type SignInResponseBody = {
  user: SignInOutput['user'];
};

export interface SignInHttpResponse extends HttpResponse<SignInResponseBody> {
  accessToken: string;
}

export class SignInController implements Controller<
  HttpRequest,
  SignInResponseBody
> {
  constructor(private readonly signInUseCase: SignInUseCase) {}

  async handle(request: HttpRequest): Promise<SignInHttpResponse> {
    const input: SignInInput = signInSchema.parse(request.body);

    const output = await this.signInUseCase.execute(input);

    return {
      statusCode: 200,
      body: { user: output.user },
      accessToken: output.accessToken,
    };
  }
}
