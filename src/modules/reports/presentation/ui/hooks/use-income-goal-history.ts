'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLatestRequest } from '@/shared/presentation/ui/hooks/use-latest-request';

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
  const latestRequest = useLatestRequest();

  const range = useMemo(() => getReportsDateRangeForMonths(months), [months]);

  const load = useCallback(async () => {
    const isLatest = latestRequest.start();

    setIsLoading(true);
    setError(null);

    const response = await getMonthlySummaryRange(months);

    if (!isLatest()) {
      return;
    }

    if (response.error) {
      setError(response.error);
      setSummaries(null);
    } else {
      setSummaries(response.data ?? []);
    }

    setIsLoading(false);
  }, [months, latestRequest]);

  useEffect(() => {
    // Re-fetches whenever the period changes (same reason as
    // use-category-history.ts); useLatestRequest discards stale responses.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();

    return () => {
      latestRequest.cancel();
    };
  }, [load, latestRequest]);

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
