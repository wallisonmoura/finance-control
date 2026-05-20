'use client';

import { useCallback, useEffect, useState } from 'react';

import { getDebts } from '../services/debt-api.service';
import { DebtUi } from '../types/debt-ui.types';

export function useDebts() {
  const [debts, setDebts] = useState<DebtUi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDebts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await getDebts();

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

    async function loadInitialDebts() {
      const response = await getDebts();

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

    void loadInitialDebts();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    debts,
    isLoading,
    error,
    refresh: loadDebts,
  };
}
