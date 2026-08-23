'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getMonthlySummaryRange } from '@/modules/finance/presentation/ui/services/finance-api.service';

import { formatReportsMonthLabel, ReportsPeriodMonths } from '../utils/reports-period';

export type IncomeExpenseEvolutionChartDatum = {
  monthLabel: string;
  totalIncome: number;
  totalExpense: number;
};

type UseIncomeExpenseEvolutionChartResult = {
  data: IncomeExpenseEvolutionChartDatum[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useIncomeExpenseEvolutionChart(
  months: ReportsPeriodMonths,
): UseIncomeExpenseEvolutionChartResult {
  const [data, setData] = useState<IncomeExpenseEvolutionChartDatum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);

    const response = await getMonthlySummaryRange(months);

    if (requestId !== requestIdRef.current) {
      return;
    }

    if (response.error) {
      setError(response.error);
      setData([]);
      setIsLoading(false);
      return;
    }

    const mapped = (response.data ?? []).map((item) => ({
      monthLabel: formatReportsMonthLabel(item.year, item.month),
      totalIncome: item.totalIncome,
      totalExpense: item.totalExpense,
    }));

    setData(mapped);
    setIsLoading(false);
  }, [months]);

  useEffect(() => {
    // See use-category-expenses-chart.ts for why this needs the
    // requestIdRef guard + eslint-disable-next-line instead of the
    // SSR-initialData guard the rest of the codebase uses.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();

    return () => {
      requestIdRef.current += 1;
    };
  }, [load]);

  return { data, isLoading, error, refresh: load };
}
