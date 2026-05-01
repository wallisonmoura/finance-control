import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeDeleteDebtUseCase } from '@/modules/debts/infra/factories/make-delete-debt-use-case';
import { makeUpdateDebtUseCase } from '@/modules/debts/infra/factories/make-update-debt-use-case';
import { DeleteDebtController } from '@/modules/debts/presentation/http/controllers/delete-debt.controller';
import { UpdateDebtController } from '@/modules/debts/presentation/http/controllers/update-debt.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const userId = await getAuthenticatedUserIdFromRequest(request);

  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const controller = new UpdateDebtController(makeUpdateDebtUseCase());

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

export async function DELETE(request: NextRequest, context: RouteContext) {
  const userId = await getAuthenticatedUserIdFromRequest(request);

  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await context.params;

    const controller = new DeleteDebtController(makeDeleteDebtUseCase());

    const response = await controller.handle({
      userId,
      params: { id },
    });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
