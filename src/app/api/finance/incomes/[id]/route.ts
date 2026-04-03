import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeDeleteIncomeUseCase } from '@/modules/finance/infra/factories/make-delete-income-use-case';
import { makeUpdateIncomeUseCase } from '@/modules/finance/infra/factories/make-update-income-use-case';
import { DeleteIncomeController } from '@/modules/finance/presentation/http/controllers/delete-income.controller';
import { UpdateIncomeController } from '@/modules/finance/presentation/http/controllers/update-income.controller';
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

    const controller = new UpdateIncomeController(makeUpdateIncomeUseCase());

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

    const controller = new DeleteIncomeController(makeDeleteIncomeUseCase());

    const response = await controller.handle({
      userId,
      params: { id },
    });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
