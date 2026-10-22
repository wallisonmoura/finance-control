import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeUndoDebtPaymentUseCase } from '@/modules/debts/infra/factories/make-undo-debt-payment-use-case';
import { UndoDebtPaymentController } from '@/modules/debts/presentation/http/controllers/undo-debt-payment.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const userId = await getAuthenticatedUserIdFromRequest(request);

  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await context.params;

    const controller = new UndoDebtPaymentController(makeUndoDebtPaymentUseCase());

    const response = await controller.handle({
      userId,
      params: { id },
    });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
