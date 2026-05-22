'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getFinanceHistory,
  getMonthlySummary,
} from '../services/finance-api.service';
import { MonthlySummaryUi } from '../types/finance-ui.types';
import {
  buildOperationalSummaryDailyRows,
  getCurrentOperationalSummaryFilters,
  getOperationalSummaryPeriod,
  type FinanceOperationalSummaryDailyRow,
  type FinanceOperationalSummaryFilters,
} from '../utils/finance-operational-summary';

export type {
  FinanceOperationalSummaryDailyRow,
  FinanceOperationalSummaryFilters,
} from '../utils/finance-operational-summary';

type UseFinanceOperationalSummaryParams = FinanceOperationalSummaryFilters & {
  initialMonthlySummary?: MonthlySummaryUi | null;
  initialDailyRows?: FinanceOperationalSummaryDailyRow[];
  initialError?: string | null;
};

export function useFinanceOperationalSummary(
  initialFilters?: UseFinanceOperationalSummaryParams,
) {
  const hasInitialResult = Boolean(
    initialFilters?.initialMonthlySummary ||
      initialFilters?.initialDailyRows ||
      initialFilters?.initialError,
  );
  const [filters, setFilters] = useState<FinanceOperationalSummaryFilters>(
    () => initialFilters ?? getCurrentOperationalSummaryFilters(),
  );
  const [monthlySummary, setMonthlySummary] =
    useState<MonthlySummaryUi | null>(
      initialFilters?.initialMonthlySummary ?? null,
    );
  const [dailyRows, setDailyRows] = useState<
    FinanceOperationalSummaryDailyRow[]
  >(initialFilters?.initialDailyRows ?? []);
  const [isLoading, setIsLoading] = useState(!hasInitialResult);
  const [error, setError] = useState<string | null>(
    initialFilters?.initialError ?? null,
  );
  const requestIdRef = useRef(0);

  const loadSummary = useCallback(
    async (nextFilters: FinanceOperationalSummaryFilters) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setIsLoading(true);
      setError(null);

      const period = getOperationalSummaryPeriod(nextFilters);

      const [monthlyResponse, historyResponse] = await Promise.all([
        getMonthlySummary({
          year: nextFilters.year,
          month: nextFilters.month,
        }),
        getFinanceHistory({
          startDate: period.startDate,
          endDate: period.endDate,
        }),
      ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (monthlyResponse.error || historyResponse.error) {
        setMonthlySummary(null);
        setDailyRows([]);
        setError(
          monthlyResponse.error ??
            historyResponse.error ??
            'Não foi possível carregar o resumo financeiro.',
        );
        setIsLoading(false);
        return;
      }

      setMonthlySummary(monthlyResponse.data ?? null);
      setDailyRows(
        buildOperationalSummaryDailyRows(
          nextFilters,
          historyResponse.data?.entries ?? [],
        ),
      );
      setIsLoading(false);
    },
    [],
  );

  const applyFilters = useCallback(
    async (nextFilters: FinanceOperationalSummaryFilters) => {
      setFilters(nextFilters);
      await loadSummary(nextFilters);
    },
    [loadSummary],
  );

  const refresh = useCallback(async () => {
    await loadSummary(filters);
  }, [filters, loadSummary]);

  useEffect(() => {
    if (hasInitialResult) {
      return () => {
        requestIdRef.current += 1;
      };
    }

    void loadSummary(filters);

    return () => {
      requestIdRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    filters,
    monthlySummary,
    dailyRows,
    isLoading,
    error,
    applyFilters,
    refresh,
  };
}
