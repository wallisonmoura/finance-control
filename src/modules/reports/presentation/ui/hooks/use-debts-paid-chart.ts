'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getDebts } from '@/modules/debts/presentation/ui/services/debt-api.service';

import {
  formatReportsMonthLabel,
  getReportsMonthKeys,
  ReportsPeriodMonths,
} from '../utils/reports-period';

export type DebtsPaidByTypeChartDatum = {
  monthLabel: string;
  oneTimeTotal: number;
  installmentTotal: number;
  recurringTotal: number;
};

type UseDebtsPaidByTypeChartResult = {
  data: DebtsPaidByTypeChartDatum[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

function toMonthKey(dateOnly: string): string {
  return dateOnly.slice(0, 7);
}

export function useDebtsPaidByTypeChart(
  months: ReportsPeriodMonths,
): UseDebtsPaidByTypeChartResult {
  const [data, setData] = useState<DebtsPaidByTypeChartDatum[]>([]);
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
    const totalsByType = {
      ONE_TIME: new Map<string, number>(),
      INSTALLMENT: new Map<string, number>(),
      RECURRING: new Map<string, number>(),
    };

    // Pending debts already have their own dedicated surfaces (the
    // due-soon bell, the pending debts page) — this chart only tracks
    // debts already paid, broken down by type instead of by status, since
    // in practice almost everything ends up PAID and a pending/paid split
    // rarely shows any variation month to month.
    for (const debt of response.data ?? []) {
      if (debt.status !== 'PAID' || !debt.paidAt) {
        continue;
      }

      const monthKey = toMonthKey(debt.paidAt);

      if (!monthKeySet.has(monthKey)) {
        continue;
      }

      const byMonth = totalsByType[debt.type];
      byMonth.set(monthKey, (byMonth.get(monthKey) ?? 0) + debt.amount);
    }

    const aggregated = monthKeys.map((monthKey) => {
      const [year, month] = monthKey.split('-').map(Number);

      return {
        monthLabel: formatReportsMonthLabel(year, month),
        oneTimeTotal: totalsByType.ONE_TIME.get(monthKey) ?? 0,
        installmentTotal: totalsByType.INSTALLMENT.get(monthKey) ?? 0,
        recurringTotal: totalsByType.RECURRING.get(monthKey) ?? 0,
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
