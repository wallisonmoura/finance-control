import { SignUpInput } from '@/modules/auth/application/dtos/sign-up.input';
import { SignUpOutput } from '@/modules/auth/application/dtos/sign-up.output';
import { SignUpUseCase } from '@/modules/auth/application/use-cases/sign-up.use-case';
import { signUpSchema } from '../schemas/sign-up.schema';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

export type SignUpResponseBody = {
  user: SignUpOutput['user'];
};

export interface SignUpHttpResponse extends HttpResponse<SignUpResponseBody> {
  accessToken: string;
}

export class SignUpController implements Controller<
  HttpRequest,
  SignUpResponseBody
> {
  constructor(private readonly signUpUseCase: SignUpUseCase) {}

  async handle(request: HttpRequest): Promise<SignUpHttpResponse> {
    const input: SignUpInput = signUpSchema.parse(request.body);

    const output = await this.signUpUseCase.execute(input);

    return {
      statusCode: 201,
      body: { user: output.user },
      accessToken: output.accessToken,
    };
  }
}
