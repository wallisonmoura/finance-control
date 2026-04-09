import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeGetAvailableBalanceUseCase } from '@/modules/finance/infra/factories/make-get-available-balance-use-case';
import { GetAvailableBalanceController } from '@/modules/finance/presentation/http/controllers/get-available-balance.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);

    if (!userId) {
      return unauthorizedResponse();
    }

    const useCase = makeGetAvailableBalanceUseCase();
    const controller = new GetAvailableBalanceController(useCase);

    const response = await controller.handle({
      userId,
    });

    return NextResponse.json(response.body, { status: response.statusCode });
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
