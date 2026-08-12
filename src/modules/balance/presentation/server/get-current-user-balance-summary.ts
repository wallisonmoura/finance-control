import { getAuthenticatedUserId } from '@/modules/auth/presentation/server/get-authenticated-user-id';
import { makeGetBalanceSummaryUseCase } from '@/modules/balance/infra/factories/make-get-balance-summary-use-case';
import { WalletNotFoundError } from '@/modules/wallet/domain/errors/wallet-not-found.error';

import { BalanceSummaryUi } from '../ui/types/balance-ui.types';

type CurrentUserBalanceSummaryResult = {
  data?: BalanceSummaryUi;
  error?: string;
};

export async function getCurrentUserBalanceSummary(): Promise<CurrentUserBalanceSummaryResult> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      error: 'Não autenticado',
    };
  }

  try {
    const useCase = makeGetBalanceSummaryUseCase();
    const data = await useCase.execute({ userId });

    return {
      data,
    };
  } catch (error) {
    if (error instanceof WalletNotFoundError) {
      return {
        error: error.message,
      };
    }

    return {
      error: 'Não foi possível carregar o resumo financeiro.',
    };
  }
}
