import { IncomeGoalKind } from '@/modules/finance/presentation/ui/utils/format-income-goal';

import { ReportsPeriodMonths } from './reports-period';

const PATHS: Record<IncomeGoalKind, string> = {
  revenue: '/relatorios/metas/faturamento',
  profit: '/relatorios/metas/lucro',
};

export function getIncomeGoalHistoryHref(
  measure: IncomeGoalKind,
  months?: ReportsPeriodMonths,
): string {
  return months ? `${PATHS[measure]}?months=${months}` : PATHS[measure];
}

// Finance → Histórico: revenue is only the income; profit needs both types.
export function getIncomeGoalLaunchesHref({
  measure,
  startDate,
  endDate,
}: {
  measure: IncomeGoalKind;
  startDate: string;
  endDate: string;
}): string {
  const params = new URLSearchParams({ startDate, endDate });

  if (measure === 'revenue') {
    params.set('type', 'INCOME');
  }

  return `/finance/history?${params.toString()}`;
}
