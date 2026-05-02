import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeGetBalanceSummaryUseCase } from '@/modules/balance/infra/factories/make-get-balance-summary-use-case';
import { GetBalanceSummaryController } from '@/modules/balance/presentation/http/controllers/get-balance-summary.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserIdFromRequest(request);

  if (!userId) {
    return unauthorizedResponse();
  }
  try {
    const controller = new GetBalanceSummaryController(
      makeGetBalanceSummaryUseCase(),
    );

    const response = await controller.handle({
      userId,
    });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
