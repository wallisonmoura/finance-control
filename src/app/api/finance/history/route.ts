import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeGetTransactionHistoryUseCase } from '@/modules/finance/infra/factories/make-get-transaction-history-use-case';
import { GetTransactionHistoryController } from '@/modules/finance/presentation/http/controllers/get-transaction-history.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);

    if (!userId) {
      return unauthorizedResponse();
    }

    const useCase = makeGetTransactionHistoryUseCase();
    const controller = new GetTransactionHistoryController(useCase);

    const response = await controller.handle({
      userId,
      query: {
        startDate: request.nextUrl.searchParams.get('startDate') ?? undefined,
        endDate: request.nextUrl.searchParams.get('endDate') ?? undefined,
        type: request.nextUrl.searchParams.get('type') ?? undefined,
      },
    });

    return NextResponse.json(response.body, { status: response.statusCode });
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
