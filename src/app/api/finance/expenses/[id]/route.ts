import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeDeleteExpenseUseCase } from '@/modules/finance/infra/factories/make-delete-expense-use-case';
import { makeUpdateExpenseUseCase } from '@/modules/finance/infra/factories/make-update-expense-use-case';
import { DeleteExpenseController } from '@/modules/finance/presentation/http/controllers/delete-expense.controller';
import { UpdateExpenseController } from '@/modules/finance/presentation/http/controllers/update-expense.controller';
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

    const controller = new UpdateExpenseController(makeUpdateExpenseUseCase());

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

    const controller = new DeleteExpenseController(makeDeleteExpenseUseCase());

    const response = await controller.handle({
      userId,
      params: { id },
    });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
