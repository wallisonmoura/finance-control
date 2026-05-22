import { useCallback, useState } from 'react';

import { getDebts } from '../services/debt-api.service';
import { DebtUi } from '../types/debt-ui.types';

type UseDebtsParams = {
  initialDebts?: DebtUi[];
  initialError?: string | null;
};

export function useDebts({
  initialDebts = [],
  initialError = null,
}: UseDebtsParams = {}) {
  const [debts, setDebts] = useState<DebtUi[]>(initialDebts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

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

  return {
    debts,
    isLoading,
    error,
    refresh: loadDebts,
  };
}
