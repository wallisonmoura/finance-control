import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeGetWalletUseCase } from '@/modules/wallet/infra/factories/make-get-wallet-use-case';
import { makeUpdateWalletBalancesUseCase } from '@/modules/wallet/infra/factories/make-update-wallet-balances-use-case';
import { GetWalletController } from '@/modules/wallet/presentation/http/controllers/get-wallet.controller';
import { UpdateWalletBalancesController } from '@/modules/wallet/presentation/http/controllers/update-wallet-balances.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserIdFromRequest(request);

  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const useCase = makeGetWalletUseCase();
    const controller = new GetWalletController(useCase);

    const response = await controller.handle({ userId });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  const userId = await getAuthenticatedUserIdFromRequest(request);

  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();

    const useCase = makeUpdateWalletBalancesUseCase();
    const controller = new UpdateWalletBalancesController(useCase);

    const response = await controller.handle({
      userId,
      body,
    });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
