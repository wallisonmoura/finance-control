import { useEffect, useState } from 'react';
import { BalanceSummaryUi } from '../types/balance-summary-ui.types';
import { getBalanceSummary } from '../services/balance-summary-api.service';

type UseBalanceSummaryState = {
  data: BalanceSummaryUi | null;
  isLoading: boolean;
  error: string | null;
};

export function useBalanceSummary(): UseBalanceSummaryState {
  const [data, setData] = useState<BalanceSummaryUi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBalanceSummary() {
      setIsLoading(true);
      setError(null);

      const response = await getBalanceSummary();

      if (!isMounted) {
        return;
      }

      if (response.error) {
        setError(response.error);
        setData(null);
        setIsLoading(false);
        return;
      }

      setData(response.data ?? null);
      setIsLoading(false);
    }

    loadBalanceSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    data,
    isLoading,
    error,
  };
}
