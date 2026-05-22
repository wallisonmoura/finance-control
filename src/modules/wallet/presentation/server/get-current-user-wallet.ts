import { getAuthenticatedUserId } from '@/modules/auth/presentation/server/get-authenticated-user-id';
import { makeGetWalletUseCase } from '@/modules/wallet/infra/factories/make-get-wallet-use-case';
import { WalletNotFoundError } from '@/modules/wallet/domain/errors/wallet-not-found.error';

import { WalletUi } from '../ui/types/wallet-ui.types';

type CurrentUserWalletResult = {
  data?: WalletUi;
  error?: string;
};

function toWalletUi(wallet: Awaited<ReturnType<ReturnType<typeof makeGetWalletUseCase>['execute']>>): WalletUi {
  return {
    ...wallet,
    createdAt: wallet.createdAt.toISOString(),
    updatedAt: wallet.updatedAt.toISOString(),
  };
}

export async function getCurrentUserWallet(): Promise<CurrentUserWalletResult> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      error: 'Não autenticado',
    };
  }

  try {
    const useCase = makeGetWalletUseCase();
    const wallet = await useCase.execute({ userId });

    return {
      data: toWalletUi(wallet),
    };
  } catch (error) {
    if (error instanceof WalletNotFoundError) {
      return {
        error: error.message,
      };
    }

    return {
      error: 'Não foi possível carregar a Wallet.',
    };
  }
}
