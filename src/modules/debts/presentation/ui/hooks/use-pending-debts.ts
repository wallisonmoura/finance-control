'use client';

import { useCallback, useEffect, useState } from 'react';

import { getPendingDebts } from '../services/debt-api.service';
import { DebtUi } from '../types/debt-ui.types';

export function usePendingDebts() {
  const [debts, setDebts] = useState<DebtUi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPendingDebts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await getPendingDebts();

    if (response.error) {
      setDebts([]);
      setError(response.error);
      setIsLoading(false);
      return;
    }

    setDebts(response.data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialPendingDebts() {
      const response = await getPendingDebts();

      if (!isMounted) {
        return;
      }

      if (response.error) {
        setDebts([]);
        setError(response.error);
        setIsLoading(false);
        return;
      }

      setDebts(response.data ?? []);
      setIsLoading(false);
    }

    void loadInitialPendingDebts();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    debts,
    isLoading,
    error,
    refresh: loadPendingDebts,
  };
}
