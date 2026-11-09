import { RequestPasswordResetUseCase } from '@/modules/auth/application/use-cases/request-password-reset.use-case';
import { PASSWORD_RESET_REQUEST_MESSAGE } from '@/modules/auth/constants/auth.constants';
import { Controller } from '@/shared/presentation/http/controller';
import { HttpRequest, HttpResponse } from '@/shared/presentation/http/http.types';
import { requestPasswordResetSchema } from '../schemas/request-password-reset.schema';

export type RequestPasswordResetResponseBody = {
  message: string;
};

type Schedule = (work: () => Promise<void>) => void;

// Answers at once with the same message for every email; the reset itself is
// scheduled to run after the response (see the route), so neither the answer
// nor its timing tells whether the account exists. Failures only go to the log.
export class RequestPasswordResetController implements Controller<
  HttpRequest,
  RequestPasswordResetResponseBody
> {
  constructor(
    private readonly makeUseCase: () => Pick<RequestPasswordResetUseCase, 'execute'>,
    private readonly schedule: Schedule,
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse<RequestPasswordResetResponseBody>> {
    const { email } = requestPasswordResetSchema.parse(request.body);

    this.schedule(async () => {
      try {
        await this.makeUseCase().execute({ email });
      } catch (error) {
        console.error('Password reset request failed:', error);
      }
    });

    return { statusCode: 200, body: { message: PASSWORD_RESET_REQUEST_MESSAGE } };
  }
}
