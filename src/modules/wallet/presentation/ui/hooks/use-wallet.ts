import { useState } from 'react';

import {
  getWallet,
  updateWalletBalances,
} from '../services/wallet-api.service';
import {
  UpdateWalletBalancesPayload,
  WalletUi,
} from '../types/wallet-ui.types';

type UseWalletState = {
  wallet: WalletUi | null;
  isUpdating: boolean;
  error: string | null;
  successMessage: string | null;
  refetch: () => Promise<void>;
  updateBalances: (payload: UpdateWalletBalancesPayload) => Promise<void>;
};

type UseWalletParams = {
  initialWallet?: WalletUi | null;
  initialError?: string | null;
};

export function useWallet({
  initialWallet = null,
  initialError = null,
}: UseWalletParams = {}): UseWalletState {
  const [wallet, setWallet] = useState<WalletUi | null>(initialWallet);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function refetch() {
    setError(null);
    setSuccessMessage(null);

    const response = await getWallet();

    if (response.error) {
      setWallet(null);
      setError(response.error);
      return;
    }

    setWallet(response.data ?? null);
  }

  async function updateBalances(payload: UpdateWalletBalancesPayload) {
    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);

    const response = await updateWalletBalances(payload);

    if (response.error) {
      setError(response.error);
      setIsUpdating(false);
      return;
    }

    setWallet(response.data ?? null);
    setSuccessMessage('Saldos da Carteira atualizados com sucesso.');
    setIsUpdating(false);
  }

  return {
    wallet,
    isUpdating,
    error,
    successMessage,
    refetch,
    updateBalances,
  };
}
