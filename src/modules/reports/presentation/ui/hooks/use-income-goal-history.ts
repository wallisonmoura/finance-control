'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getMonthlySummaryRange } from '@/modules/finance/presentation/ui/services/finance-api.service';
import {
  IncomeGoalTargetsUi,
  MonthlySummaryUi,
} from '@/modules/finance/presentation/ui/types/finance-ui.types';
import { IncomeGoalKind } from '@/modules/finance/presentation/ui/utils/format-income-goal';
import { getCurrentBusinessDateValue } from '@/shared/presentation/ui/lib/date';

import { buildIncomeGoalHistory, IncomeGoalHistory } from '../utils/income-goal-history';
import {
  getReportsDateRangeForMonths,
  getReportsMonthKeys,
  ReportsDateRange,
  ReportsPeriodMonths,
} from '../utils/reports-period';

export type UseIncomeGoalHistoryResult = {
  history: IncomeGoalHistory | null;
  targets: IncomeGoalTargetsUi;
  range: ReportsDateRange;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  setTargets: (targets: IncomeGoalTargetsUi) => void;
};

export function useIncomeGoalHistory(
  measure: IncomeGoalKind,
  months: ReportsPeriodMonths,
  initialTargets: IncomeGoalTargetsUi,
): UseIncomeGoalHistoryResult {
  const [summaries, setSummaries] = useState<MonthlySummaryUi[] | null>(null);
  const [targets, setTargets] = useState<IncomeGoalTargetsUi>(initialTargets);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const range = useMemo(() => getReportsDateRangeForMonths(months), [months]);

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
      setSummaries(null);
    } else {
      setSummaries(response.data ?? []);
    }

    setIsLoading(false);
  }, [months]);

  useEffect(() => {
    // Re-fetches whenever the period changes (same reason as
    // use-category-history.ts); requestIdRef discards stale responses.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();

    return () => {
      requestIdRef.current += 1;
    };
  }, [load]);

  const target = measure === 'revenue' ? targets.revenueTarget : targets.profitTarget;

  const history = useMemo(() => {
    if (!summaries) {
      return null;
    }

    return buildIncomeGoalHistory({
      summaries,
      monthKeys: getReportsMonthKeys(months),
      measure,
      target,
      currentMonthKey: getCurrentBusinessDateValue().slice(0, 7),
    });
  }, [summaries, months, measure, target]);

  return { history, targets, range, isLoading, error, refresh: load, setTargets };
}
