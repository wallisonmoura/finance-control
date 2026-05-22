import { useCallback, useState } from 'react';

import { getPendingDebts } from '../services/debt-api.service';
import { DebtUi } from '../types/debt-ui.types';

type UsePendingDebtsParams = {
  initialDebts?: DebtUi[];
  initialError?: string | null;
};

export function usePendingDebts({
  initialDebts = [],
  initialError = null,
}: UsePendingDebtsParams = {}) {
  const [debts, setDebts] = useState<DebtUi[]>(initialDebts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

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

  return {
    debts,
    isLoading,
    error,
    refresh: loadPendingDebts,
  };
}
