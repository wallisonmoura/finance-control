import { ChangePasswordInput } from '@/modules/auth/application/dtos/change-password.input';
import { ChangePasswordUseCase } from '@/modules/auth/application/use-cases/change-password.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { changePasswordSchema } from '../schemas/change-password.schema';

export type ChangePasswordResponseBody = {
  message: string;
};

export interface ChangePasswordHttpResponse
  extends HttpResponse<ChangePasswordResponseBody> {
  accessToken: string;
}

export class ChangePasswordController implements Controller<
  HttpRequest,
  ChangePasswordResponseBody
> {
  constructor(private readonly changePasswordUseCase: Pick<ChangePasswordUseCase, 'execute'>) {}

  async handle(
    request: HttpRequest,
  ): Promise<ChangePasswordHttpResponse> {
    const { currentPassword, newPassword } = changePasswordSchema.parse(
      request.body,
    );

    const input: ChangePasswordInput = {
      userId: request.userId!,
      currentPassword,
      newPassword,
    };

    const { accessToken } = await this.changePasswordUseCase.execute(input);

    return {
      statusCode: 200,
      body: { message: 'Senha alterada com sucesso.' },
      accessToken,
    };
  }
}
