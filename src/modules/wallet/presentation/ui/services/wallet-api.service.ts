import {
  UpdateWalletBalancesPayload,
  WalletUi,
} from '../types/wallet-ui.types';

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

export type WalletApiResponse<T> = {
  data?: T;
  error?: string;
};

const WALLET_API_URL = '/api/wallet';

async function getErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as ApiErrorResponse;

    return (
      body.message ||
      body.error ||
      'Não foi possível processar a solicitação da Wallet.'
    );
  } catch {
    return 'Não foi possível processar a solicitação da Wallet.';
  }
}

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
      error: await getErrorMessage(response),
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
      error: await getErrorMessage(response),
    };
  }

  const data = (await response.json()) as WalletUi;

  return {
    data,
  };
}
