import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeGetCurrentUserUseCase } from '@/modules/auth/infra/factories/make-get-current-user.use-case';
import { GetCurrentUserController } from '@/modules/auth/presentation/http/controllers/get-current-user.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);

    if (!userId) {
      return unauthorizedResponse();
    }

    const useCase = makeGetCurrentUserUseCase();
    const controller = new GetCurrentUserController(useCase);

    const response = await controller.handle({ userId });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
