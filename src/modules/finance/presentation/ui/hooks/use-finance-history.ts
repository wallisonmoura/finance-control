'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getFinanceHistory } from '../services/finance-api.service';
import {
  FinanceHistoryFiltersUi,
  FinanceHistoryUi,
} from '../types/finance-ui.types';

type UseFinanceHistoryInitialFilters = Partial<FinanceHistoryFiltersUi>;

export function getCurrentMonthFilters(
  initialFilters?: UseFinanceHistoryInitialFilters,
): FinanceHistoryFiltersUi {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();

  const startDate = new Date(Date.UTC(year, month, 1))
    .toISOString()
    .slice(0, 10);

  const endDate = new Date(Date.UTC(year, month + 1, 0))
    .toISOString()
    .slice(0, 10);

  return {
    startDate,
    endDate,
    ...initialFilters,
  };
}

export function useFinanceHistory(
  initialFilters?: UseFinanceHistoryInitialFilters,
) {
  const [filters, setFilters] = useState<FinanceHistoryFiltersUi>(() =>
    getCurrentMonthFilters(initialFilters),
  );

  const [data, setData] = useState<FinanceHistoryUi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
