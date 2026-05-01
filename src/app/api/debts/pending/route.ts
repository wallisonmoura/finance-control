import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeListPendingDebtsUseCase } from '@/modules/debts/infra/factories/make-list-pending-debts-use-case';
import { ListPendingDebtsController } from '@/modules/debts/presentation/http/controllers/list-pending-debts.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserIdFromRequest(request);

  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const controller = new ListPendingDebtsController(
      makeListPendingDebtsUseCase(),
    );

    const response = await controller.handle({
      userId,
    });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
