'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getExpenseCategories,
  getFullFinanceHistory,
} from '@/modules/finance/presentation/ui/services/finance-api.service';

import { getReportsDateRangeForMonths, ReportsPeriodMonths } from '../utils/reports-period';

export type CategoryExpenseChartDatum = {
  categoryId: string;
  categoryName: string;
  total: number;
};

type UseCategoryExpensesChartResult = {
  data: CategoryExpenseChartDatum[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useCategoryExpensesChart(
  months: ReportsPeriodMonths,
): UseCategoryExpensesChartResult {
  const [data, setData] = useState<CategoryExpenseChartDatum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);

    const { startDate, endDate } = getReportsDateRangeForMonths(months);

    const [historyResponse, categoriesResponse] = await Promise.all([
      getFullFinanceHistory({ startDate, endDate, type: 'EXPENSE' }),
      getExpenseCategories(),
    ]);

    if (requestId !== requestIdRef.current) {
      return;
    }

    if (historyResponse.error) {
      setError(historyResponse.error);
      setData([]);
      setIsLoading(false);
      return;
    }

    if (categoriesResponse.error) {
      setError(categoriesResponse.error);
      setData([]);
      setIsLoading(false);
      return;
    }

    const categoryNameById = new Map(
      (categoriesResponse.data ?? []).map((category) => [
        category.id,
        category.name,
      ]),
    );
    const totalByCategoryId = new Map<string, number>();

    for (const entry of historyResponse.data?.entries ?? []) {
      if (!entry.categoryId) {
        continue;
      }

      totalByCategoryId.set(
        entry.categoryId,
        (totalByCategoryId.get(entry.categoryId) ?? 0) + entry.amount,
      );
    }

    const aggregated = Array.from(totalByCategoryId.entries())
      .map(([categoryId, total]) => ({
        categoryId,
        categoryName: categoryNameById.get(categoryId) ?? 'Sem categoria',
        total,
      }))
      .sort((a, b) => b.total - a.total);

    setData(aggregated);
    setIsLoading(false);
  }, [months]);

  useEffect(() => {
    // This effect must re-fetch every time `months` changes (there's no
    // separate user-action handler like other hooks in this codebase have —
    // the period selector just re-renders with a new `months` prop), so it
    // can't use the "only fetch when there's no SSR initialData" guard the
    // rest of the codebase relies on to satisfy this rule. requestIdRef
    // above still discards stale in-flight responses if `months` changes
    // again before the first request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();

    return () => {
      requestIdRef.current += 1;
    };
  }, [load]);

  return { data, isLoading, error, refresh: load };
}
