import {
  UpdateWalletBalancesPayload,
  WalletUi,
} from '../types/wallet-ui.types';
import { parseApiError } from '@/shared/presentation/ui/lib/parse-api-error';

export type WalletApiResponse<T> = {
  data?: T;
  error?: string;
};

const WALLET_API_URL = '/api/wallet';

const WALLET_ERROR_FALLBACK_MESSAGE =
  'Não foi possível processar a solicitação da Carteira.';

export async function getWallet(): Promise<WalletApiResponse<WalletUi>> {
  const response = await fetch(WALLET_API_URL, {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return {
      error: await parseApiError(response, WALLET_ERROR_FALLBACK_MESSAGE),
    };
  }

  const data = (await response.json()) as WalletUi;

  return {
    data,
  };
}

export async function updateWalletBalances(
  payload: UpdateWalletBalancesPayload,
): Promise<WalletApiResponse<WalletUi>> {
  const response = await fetch(WALLET_API_URL, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return {
      error: await parseApiError(response, WALLET_ERROR_FALLBACK_MESSAGE),
    };
  }

  const data = (await response.json()) as WalletUi;

  return {
    data,
  };
}
