import { GetCurrentUserUseCase } from '@/modules/auth/application/use-cases/get-current-user.use-case';
import { TokenService } from '@/modules/auth/domain/services/token.service';
import { unauthorizedResponse } from '../helpers/unauthorized-response';
import { NextResponse } from 'next/server';
import { UserNotFoundError } from '@/modules/auth/domain/errors/user-not-found.error';
import { AUTH_INVALID_TOKEN_MESSAGE } from '@/modules/auth/constants/auth.constants';

type HttpRequest = {
  token: string | null;
};

export class GetCurrentUserController {
  constructor(
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly tokenService: TokenService,
  ) {}

  async handle(request: HttpRequest) {
    if (!request.token) {
      return unauthorizedResponse();
    }

    try {
      const payload = await this.tokenService.verifyAcessToken(request.token);

      const output = await this.getCurrentUserUseCase.execute({
        userId: payload.sub,
      });

      return NextResponse.json(output, { status: 200 });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return unauthorizedResponse();
      }

      return unauthorizedResponse(AUTH_INVALID_TOKEN_MESSAGE);
    }
  }
}
