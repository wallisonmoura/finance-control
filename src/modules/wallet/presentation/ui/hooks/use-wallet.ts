'use client';

import { useEffect, useState } from 'react';

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
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  successMessage: string | null;
  refetch: () => Promise<void>;
  updateBalances: (payload: UpdateWalletBalancesPayload) => Promise<void>;
};

export function useWallet(): UseWalletState {
  const [wallet, setWallet] = useState<WalletUi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function refetch() {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const response = await getWallet();

    if (response.error) {
      setWallet(null);
      setError(response.error);
      setIsLoading(false);
      return;
    }

    setWallet(response.data ?? null);
    setIsLoading(false);
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
    setSuccessMessage('Saldos da Wallet atualizados com sucesso.');
    setIsUpdating(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadWallet() {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await getWallet();

      if (!isMounted) {
        return;
      }

      if (response.error) {
        setWallet(null);
        setError(response.error);
        setIsLoading(false);
        return;
      }

      setWallet(response.data ?? null);
      setIsLoading(false);
    }

    loadWallet();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    wallet,
    isLoading,
    isUpdating,
    error,
    successMessage,
    refetch,
    updateBalances,
  };
}
