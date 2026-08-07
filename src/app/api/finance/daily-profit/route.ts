import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeCalculateDailyProfitUseCase } from '@/modules/finance/infra/factories/make-calculate-daily-profit-use-case';
import { CalculateDailyProfitController } from '@/modules/finance/presentation/http/controllers/calculate-daily-profit.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);

    if (!userId) {
      return unauthorizedResponse();
    }

    const useCase = makeCalculateDailyProfitUseCase();
    const controller = new CalculateDailyProfitController(useCase);

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
