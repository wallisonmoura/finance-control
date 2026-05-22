'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getFinanceHistory } from '../services/finance-api.service';
import {
  FinanceHistoryFiltersUi,
  FinanceHistoryUi,
} from '../types/finance-ui.types';
import { getCurrentMonthFilters } from '../utils/finance-filters';

type UseFinanceHistoryParams = Partial<FinanceHistoryFiltersUi> & {
  initialData?: FinanceHistoryUi | null;
  initialError?: string | null;
};

export function useFinanceHistory(initialFilters?: UseFinanceHistoryParams) {
  const {
    initialData = null,
    initialError = null,
    startDate,
    endDate,
    type,
  } = initialFilters ?? {};
  const hasInitialResult = Boolean(initialData || initialError);

  const [filters, setFilters] = useState<FinanceHistoryFiltersUi>(() =>
    getCurrentMonthFilters({
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(type ? { type } : {}),
    }),
  );

  const [data, setData] = useState<FinanceHistoryUi | null>(initialData);
  const [isLoading, setIsLoading] = useState(!hasInitialResult);
  const [error, setError] = useState<string | null>(initialError);
  const requestIdRef = useRef(0);

  const loadHistory = useCallback(
    async (nextFilters: FinanceHistoryFiltersUi) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setIsLoading(true);
      setError(null);

      const response = await getFinanceHistory(nextFilters);

      if (requestId !== requestIdRef.current) {
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
    },
    [],
  );

  const applyFilters = useCallback(
    async (nextFilters: FinanceHistoryFiltersUi) => {
      setFilters(nextFilters);
      await loadHistory(nextFilters);
    },
    [loadHistory],
  );

  const refresh = useCallback(async () => {
    await loadHistory(filters);
  }, [filters, loadHistory]);

  useEffect(() => {
    if (hasInitialResult) {
      return () => {
        requestIdRef.current += 1;
      };
    }

    void loadHistory(filters);

    return () => {
      requestIdRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entries = useMemo(() => data?.entries ?? [], [data]);

  return {
    data,
    entries,
    totalIncome: data?.totalIncome ?? 0,
    totalExpense: data?.totalExpense ?? 0,
    balance: data?.balance ?? 0,
    filters,
    isLoading,
    error,
    applyFilters,
    refresh,
  };
}
