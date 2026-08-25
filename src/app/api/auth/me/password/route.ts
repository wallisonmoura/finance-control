import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeChangePasswordUseCase } from '@/modules/auth/infra/factories/make-change-password-use-case';
import { ChangePasswordController } from '@/modules/auth/presentation/http/controllers/change-password.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest) {
  const userId = await getAuthenticatedUserIdFromRequest(request);

  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();

    const useCase = makeChangePasswordUseCase();
    const controller = new ChangePasswordController(useCase);

    const response = await controller.handle({ userId, body });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
