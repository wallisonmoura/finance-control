'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  getFinanceHistory,
  getMonthlySummary,
} from '../services/finance-api.service';
import {
  FinanceEntryUi,
  MonthlySummaryUi,
} from '../types/finance-ui.types';

export type FinanceOperationalSummaryFilters = {
  year: number;
  month: number;
};

export type FinanceOperationalSummaryDailyRow = {
  date: string;
  day: number;
  totalIncome: number;
  totalExpense: number;
  result: number;
};

function toDateOnly(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

function getLastDayOfMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function getMonthPeriod(filters: FinanceOperationalSummaryFilters) {
  const lastDay = getLastDayOfMonth(filters.year, filters.month);

  return {
    startDate: toDateOnly(filters.year, filters.month, 1),
    endDate: toDateOnly(filters.year, filters.month, lastDay),
    lastDay,
  };
}

function buildDailyRows(
  filters: FinanceOperationalSummaryFilters,
  entries: FinanceEntryUi[],
): FinanceOperationalSummaryDailyRow[] {
  const { lastDay } = getMonthPeriod(filters);
  const rows = new Map<string, FinanceOperationalSummaryDailyRow>();

  for (let day = 1; day <= lastDay; day += 1) {
    const date = toDateOnly(filters.year, filters.month, day);

    rows.set(date, {
      date,
      day,
      totalIncome: 0,
      totalExpense: 0,
      result: 0,
    });
  }

  for (const entry of entries) {
    const date = entry.date.slice(0, 10);
    const row = rows.get(date);

    if (!row) {
      continue;
    }

    if (entry.type === 'INCOME') {
      row.totalIncome += entry.amount;
    } else {
      row.totalExpense += entry.amount;
    }

    row.result = row.totalIncome - row.totalExpense;
  }

  return [...rows.values()];
}

export function getCurrentOperationalSummaryFilters(): FinanceOperationalSummaryFilters {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

export function useFinanceOperationalSummary(
  initialFilters?: FinanceOperationalSummaryFilters,
) {
  const [filters, setFilters] = useState<FinanceOperationalSummaryFilters>(
    () => initialFilters ?? getCurrentOperationalSummaryFilters(),
  );
  const [monthlySummary, setMonthlySummary] =
    useState<MonthlySummaryUi | null>(null);
  const [dailyRows, setDailyRows] = useState<
    FinanceOperationalSummaryDailyRow[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(
    async (nextFilters: FinanceOperationalSummaryFilters) => {
      setIsLoading(true);
      setError(null);

      const period = getMonthPeriod(nextFilters);

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

      if (monthlyResponse.error || historyResponse.error) {
        setMonthlySummary(null);
        setDailyRows([]);
        setError(
          monthlyResponse.error ??
            historyResponse.error ??
            'Nao foi possivel carregar o resumo financeiro.',
        );
        setIsLoading(false);
        return;
      }

      setMonthlySummary(monthlyResponse.data ?? null);
      setDailyRows(buildDailyRows(nextFilters, historyResponse.data?.entries ?? []));
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
    let isMounted = true;

    async function loadInitialSummary() {
      const period = getMonthPeriod(filters);

      const [monthlyResponse, historyResponse] = await Promise.all([
        getMonthlySummary({
          year: filters.year,
          month: filters.month,
        }),
        getFinanceHistory({
          startDate: period.startDate,
          endDate: period.endDate,
        }),
      ]);

      if (!isMounted) {
        return;
      }

      if (monthlyResponse.error || historyResponse.error) {
        setMonthlySummary(null);
        setDailyRows([]);
        setError(
          monthlyResponse.error ??
            historyResponse.error ??
            'Nao foi possivel carregar o resumo financeiro.',
        );
        setIsLoading(false);
        return;
      }

      setMonthlySummary(monthlyResponse.data ?? null);
      setDailyRows(buildDailyRows(filters, historyResponse.data?.entries ?? []));
      setIsLoading(false);
    }

    void loadInitialSummary();

    return () => {
      isMounted = false;
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
