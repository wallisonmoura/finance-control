import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeCalculateMonthlySummaryRangeUseCase } from '@/modules/finance/infra/factories/make-calculate-monthly-summary-range-use-case';
import { CalculateMonthlySummaryRangeController } from '@/modules/finance/presentation/http/controllers/calculate-monthly-summary-range.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserIdFromRequest(request);

  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const useCase = makeCalculateMonthlySummaryRangeUseCase();
    const controller = new CalculateMonthlySummaryRangeController(useCase);

    const response = await controller.handle({
      userId,
      query: {
        months: request.nextUrl.searchParams.get('months') ?? undefined,
      },
    });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
