import { useCallback, useState } from 'react';

import { DebtApiResponse, DebtUi } from '../types/debts-ui.types';

type UseDebtListStateParams = {
  fetchDebts: () => Promise<DebtApiResponse<DebtUi[]>>;
  initialDebts?: DebtUi[];
  initialError?: string | null;
};

export function useDebtListState({
  fetchDebts,
  initialDebts = [],
  initialError = null,
}: UseDebtListStateParams) {
  const [debts, setDebts] = useState<DebtUi[]>(initialDebts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await fetchDebts();

    if (response.error) {
      setDebts([]);
      setError(response.error);
      setIsLoading(false);
      return;
    }

    setDebts(response.data ?? []);
    setIsLoading(false);
  }, [fetchDebts]);

  return {
    debts,
    isLoading,
    error,
    refresh,
  };
}
