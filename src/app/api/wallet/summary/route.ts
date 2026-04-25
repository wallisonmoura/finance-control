import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeGetWalletSummaryUseCase } from '@/modules/wallet/infra/factories/make-get-wallet-summary-use-case';
import { GetWalletSummaryController } from '@/modules/wallet/presentation/http/controllers/get-wallet-summary.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);

    if (!userId) {
      return unauthorizedResponse();
    }

    const useCase = makeGetWalletSummaryUseCase();
    const controller = new GetWalletSummaryController(useCase);

    const response = await controller.handle({ userId });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
