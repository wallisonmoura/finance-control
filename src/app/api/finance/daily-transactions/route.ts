import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeGetDailyTransactionsUseCase } from '@/modules/finance/infra/factories/make-get-daily-transactions-use-case';
import { GetDailyTransactionsController } from '@/modules/finance/presentation/http/controllers/get-daily-transactions.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserIdFromRequest(request);

  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const useCase = makeGetDailyTransactionsUseCase();
    const controller = new GetDailyTransactionsController(useCase);

    const response = await controller.handle({
      userId,
      query: {
        date: request.nextUrl.searchParams.get('date') ?? undefined,
      },
    });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
