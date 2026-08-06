import { GetCurrentUserInput } from '@/modules/auth/application/dtos/get-current-user.input';
import { GetCurrentUserOutput } from '@/modules/auth/application/dtos/get-current-user.output';
import { GetCurrentUserUseCase } from '@/modules/auth/application/use-cases/get-current-user.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

export class GetCurrentUserController implements Controller<
  HttpRequest,
  GetCurrentUserOutput
> {
  constructor(private readonly getCurrentUserUseCase: GetCurrentUserUseCase) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<GetCurrentUserOutput>> {
    const input: GetCurrentUserInput = {
      userId: request.userId!,
    };

    const output = await this.getCurrentUserUseCase.execute(input);

    return {
      statusCode: 200,
      body: output,
    };
  }
}
