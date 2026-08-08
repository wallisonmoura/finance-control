import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeListExpenseCategoriesUseCase } from '@/modules/finance/infra/factories/make-list-expense-categories-use-case';
import { ListExpenseCategoriesController } from '@/modules/finance/presentation/http/controllers/list-expense-categories.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserIdFromRequest(request);

  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const controller = new ListExpenseCategoriesController(
      makeListExpenseCategoriesUseCase(),
    );

    const response = await controller.handle({
      userId,
    });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
