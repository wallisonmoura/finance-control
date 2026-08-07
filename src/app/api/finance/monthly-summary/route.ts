import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeCalculateMonthlySummaryUseCase } from '@/modules/finance/infra/factories/make-calculate-monthly-summary-use-case';
import { CalculateMonthlySummaryController } from '@/modules/finance/presentation/http/controllers/calculate-monthly-summary.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);

    if (!userId) {
      return unauthorizedResponse();
    }

    const useCase = makeCalculateMonthlySummaryUseCase();
    const controller = new CalculateMonthlySummaryController(useCase);

    const response = await controller.handle({
      userId,
      query: {
        year: request.nextUrl.searchParams.get('year') ?? undefined,
        month: request.nextUrl.searchParams.get('month') ?? undefined,
      },
    });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
