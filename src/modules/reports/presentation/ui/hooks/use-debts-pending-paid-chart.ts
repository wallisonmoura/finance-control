'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getDebts } from '@/modules/debts/presentation/ui/services/debt-api.service';

import {
  formatReportsMonthLabel,
  getReportsMonthKeys,
  ReportsPeriodMonths,
} from '../utils/reports-period';

export type DebtsPendingPaidChartDatum = {
  monthLabel: string;
  pendingTotal: number;
  paidTotal: number;
};

type UseDebtsPendingPaidChartResult = {
  data: DebtsPendingPaidChartDatum[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

function toMonthKey(dateOnly: string): string {
  return dateOnly.slice(0, 7);
}

export function useDebtsPendingPaidChart(
  months: ReportsPeriodMonths,
): UseDebtsPendingPaidChartResult {
  const [data, setData] = useState<DebtsPendingPaidChartDatum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);

    const response = await getDebts();

    if (requestId !== requestIdRef.current) {
      return;
    }

    if (response.error) {
      setError(response.error);
      setData([]);
      setIsLoading(false);
      return;
    }

    const monthKeys = getReportsMonthKeys(months);
    const monthKeySet = new Set(monthKeys);
    const pendingByMonth = new Map<string, number>();
    const paidByMonth = new Map<string, number>();

    // Each debt counts in exactly one series/month by its current status —
    // PENDING by dueDate, PAID by paidAt — never both, mirroring RG41 (a
    // paid debt stops composing pendingDebts).
    for (const debt of response.data ?? []) {
      if (debt.status === 'PENDING') {
        const monthKey = toMonthKey(debt.dueDate);

        if (monthKeySet.has(monthKey)) {
          pendingByMonth.set(
            monthKey,
            (pendingByMonth.get(monthKey) ?? 0) + debt.amount,
          );
        }

        continue;
      }

      if (debt.paidAt) {
        const monthKey = toMonthKey(debt.paidAt);

        if (monthKeySet.has(monthKey)) {
          paidByMonth.set(
            monthKey,
            (paidByMonth.get(monthKey) ?? 0) + debt.amount,
          );
        }
      }
    }

    const aggregated = monthKeys.map((monthKey) => {
      const [year, month] = monthKey.split('-').map(Number);

      return {
        monthLabel: formatReportsMonthLabel(year, month),
        pendingTotal: pendingByMonth.get(monthKey) ?? 0,
        paidTotal: paidByMonth.get(monthKey) ?? 0,
      };
    });

    setData(aggregated);
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
