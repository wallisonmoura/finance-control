import { ResetPasswordUseCase } from '@/modules/auth/application/use-cases/reset-password.use-case';
import { PASSWORD_RESET_SUCCESS_MESSAGE } from '@/modules/auth/constants/auth.constants';
import { Controller } from '@/shared/presentation/http/controller';
import { HttpRequest, HttpResponse } from '@/shared/presentation/http/http.types';
import { resetPasswordSchema } from '../schemas/reset-password.schema';

export type ResetPasswordResponseBody = {
  message: string;
};

export class ResetPasswordController implements Controller<HttpRequest, ResetPasswordResponseBody> {
  constructor(private readonly resetPasswordUseCase: Pick<ResetPasswordUseCase, 'execute'>) {}

  async handle(request: HttpRequest): Promise<HttpResponse<ResetPasswordResponseBody>> {
    const input = resetPasswordSchema.parse(request.body);

    await this.resetPasswordUseCase.execute(input);

    return { statusCode: 200, body: { message: PASSWORD_RESET_SUCCESS_MESSAGE } };
  }
}
