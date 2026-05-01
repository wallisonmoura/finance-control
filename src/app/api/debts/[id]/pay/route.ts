import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makePayDebtUseCase } from '@/modules/debts/infra/factories/make-pay-debt-use-case';
import { PayDebtController } from '@/modules/debts/presentation/http/controllers/pay-debt.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const userId = await getAuthenticatedUserIdFromRequest(request);

  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const controller = new PayDebtController(makePayDebtUseCase());

    const response = await controller.handle({
      userId,
      params: { id },
      body,
    });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
