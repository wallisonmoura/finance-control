import { requireActiveSession } from '@/modules/auth/presentation/server/require-active-session';
import { makeGetBalanceSummaryUseCase } from '@/modules/balance/infra/factories/make-get-balance-summary-use-case';
import { WalletNotFoundError } from '@/modules/wallet/domain/errors/wallet-not-found.error';

import { BalanceSummaryUi } from '../ui/types/balance-ui.types';

type CurrentUserBalanceSummaryResult = {
  data?: BalanceSummaryUi;
  error?: string;
};

export async function getCurrentUserBalanceSummary(): Promise<CurrentUserBalanceSummaryResult> {
  const userId = await requireActiveSession();

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
