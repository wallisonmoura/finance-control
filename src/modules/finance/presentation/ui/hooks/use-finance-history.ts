'use client';

import { useCallback, useEffect, useState } from 'react';

import { getFinanceHistory } from '../services/finance-api.service';
import {
  FinanceHistoryFiltersUi,
  FinanceHistoryUi,
} from '../types/finance-ui.types';

type UseFinanceHistoryState = {
  data: FinanceHistoryUi | null;
  isLoading: boolean;
  error: string | null;
};

export function useFinanceHistory(initialFilters: FinanceHistoryFiltersUi) {
  const [filters, setFilters] =
    useState<FinanceHistoryFiltersUi>(initialFilters);

  const [state, setState] = useState<UseFinanceHistoryState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const loadHistory = useCallback(async () => {
    setState((current) => ({
      ...current,
      isLoading: true,
      error: null,
    }));

    const response = await getFinanceHistory(filters);

    if (response.error) {
      setState({
        data: null,
        isLoading: false,
        error: response.error,
      });

      return;
    }

    setState({
      data: response.data ?? null,
      isLoading: false,
      error: null,
    });
  }, [filters]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setState((current) => ({
        ...current,
        isLoading: true,
        error: null,
      }));

      const response = await getFinanceHistory(filters);

      if (!isMounted) {
        return;
      }

      if (response.error) {
        setState({
          data: null,
          isLoading: false,
          error: response.error,
        });

        return;
      }

      setState({
        data: response.data ?? null,
        isLoading: false,
        error: null,
      });
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  return {
    data: state.data,
    entries: state.data?.entries ?? [],
    totalIncome: state.data?.totalIncome ?? 0,
    totalExpense: state.data?.totalExpense ?? 0,
    balance: state.data?.balance ?? 0,
    isLoading: state.isLoading,
    error: state.error,
    filters,
    setFilters,
    refresh: loadHistory,
  };
}
