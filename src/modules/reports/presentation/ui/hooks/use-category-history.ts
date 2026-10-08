'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  getExpenseCategories,
  getFullFinanceHistory,
} from '@/modules/finance/presentation/ui/services/finance-api.service';
import { getCurrentBusinessDateValue } from '@/shared/presentation/ui/lib/date';

import {
  buildCategoryHistory,
  CategoryHistory,
  CategoryHistoryEntry,
} from '../utils/category-history';
import {
  getReportsDateRangeForMonths,
  getReportsMonthKeys,
  ReportsDateRange,
  ReportsPeriodMonths,
} from '../utils/reports-period';

export type CategoryHistoryCategory = {
  id: string;
  name: string;
  monthlyLimit: number | null;
};

export type UseCategoryHistoryResult = {
  category: CategoryHistoryCategory | null;
  history: CategoryHistory | null;
  range: ReportsDateRange;
  isLoading: boolean;
  notFound: boolean;
  error: string | null;
  refresh: () => void;
  setLimit: (limit: number | null) => void;
};

export function useCategoryHistory(
  categoryId: string,
  months: ReportsPeriodMonths,
): UseCategoryHistoryResult {
  const [category, setCategory] = useState<CategoryHistoryCategory | null>(null);
  const [entries, setEntries] = useState<CategoryHistoryEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const range = useMemo(() => getReportsDateRangeForMonths(months), [months]);

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);
    setNotFound(false);

    const [historyResponse, categoriesResponse] = await Promise.all([
      getFullFinanceHistory({ ...range, type: 'EXPENSE', categoryId }),
      getExpenseCategories(),
    ]);

    if (requestId !== requestIdRef.current) {
      return;
    }

    if (categoriesResponse.error) {
      setError(categoriesResponse.error);
      setEntries(null);
      setIsLoading(false);
      return;
    }

    // Resolve the category before looking at the history: the list only
    // holds the user's active categories, so an unknown id, one from another
    // user or an inactive one all read as "not found" — even a malformed id,
    // which the history API refuses with a validation error.
    const found = (categoriesResponse.data ?? []).find(
      (item) => item.id === categoryId,
    );

    if (!found) {
      setNotFound(true);
      setCategory(null);
      setEntries(null);
      setIsLoading(false);
      return;
    }

    if (historyResponse.error) {
      setError(historyResponse.error);
      setEntries(null);
      setIsLoading(false);
      return;
    }

    setCategory({
      id: found.id,
      name: found.name,
      monthlyLimit: found.monthlyLimit ?? null,
    });
    setEntries(
      (historyResponse.data?.entries ?? []).map((entry) => ({
        date: entry.date,
        amount: entry.amount,
      })),
    );
    setIsLoading(false);
  }, [categoryId, range]);

  useEffect(() => {
    // Re-fetches whenever the category or the period changes (same reason as
    // use-category-expenses-chart.ts); requestIdRef discards stale responses.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();

    return () => {
      requestIdRef.current += 1;
    };
  }, [load]);

  const history = useMemo(() => {
    if (!entries || !category) {
      return null;
    }

    return buildCategoryHistory({
      entries,
      monthKeys: getReportsMonthKeys(months),
      currentMonthKey: getCurrentBusinessDateValue().slice(0, 7),
      monthlyLimit: category.monthlyLimit,
    });
  }, [entries, category, months]);

  // After saving the goal on the page: the history itself did not change, so
  // only recalculate with the new limit instead of fetching again.
  const setLimit = useCallback((limit: number | null) => {
    setCategory((current) => current && { ...current, monthlyLimit: limit });
  }, []);

  return {
    category,
    history,
    range,
    isLoading,
    notFound,
    error,
    refresh: load,
    setLimit,
  };
}
