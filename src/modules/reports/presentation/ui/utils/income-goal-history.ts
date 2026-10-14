import { MonthlySummaryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';
import { IncomeGoalKind } from '@/modules/finance/presentation/ui/utils/format-income-goal';
import { roundToCents } from '@/shared/domain/money/round-to-cents';

import { formatReportsMonthLabel } from './reports-period';

export type IncomeGoalMonthStatus = 'CURRENT' | 'REACHED' | 'BELOW' | 'NEGATIVE' | 'NONE';

export type IncomeGoalHistoryMonth = {
  // 'YYYY-MM'
  key: string;
  label: string;
  value: number;
  isCurrent: boolean;
  status: IncomeGoalMonthStatus;
};

export type IncomeGoalHistory = {
  months: IncomeGoalHistoryMonth[];
  // null only when the window has no closed month.
  averagePerMonth: number | null;
  bestMonth: { key: string; label: string; value: number } | null;
  periodTotal: number;
  // null when the measure has no goal.
  reached: { count: number; closedMonths: number } | null;
  negative: { count: number; closedMonths: number };
  hasData: boolean;
};

function keyOf(summary: MonthlySummaryUi): string {
  return `${summary.year}-${String(summary.month).padStart(2, '0')}`;
}

function statusOf(value: number, isCurrent: boolean, target: number | null): IncomeGoalMonthStatus {
  if (isCurrent) return 'CURRENT';
  if (value < 0) return 'NEGATIVE';
  if (target === null) return 'NONE';
  return value >= target ? 'REACHED' : 'BELOW';
}

/**
 * Month-by-month revenue (total income) or profit (result) against the fixed
 * monthly goal (spec 2026-10-10-income-goal-history-design.md §3). Only
 * closed months feed the average, the best month and the counts; the
 * current month is partial ("até hoje") and only adds to the period total.
 */
export function buildIncomeGoalHistory({
  summaries,
  monthKeys,
  measure,
  target,
  currentMonthKey,
}: {
  summaries: MonthlySummaryUi[];
  monthKeys: string[];
  measure: IncomeGoalKind;
  target: number | null;
  currentMonthKey: string;
}): IncomeGoalHistory {
  const byKey = new Map(summaries.map((summary) => [keyOf(summary), summary]));

  const months = monthKeys.map((key): IncomeGoalHistoryMonth => {
    const summary = byKey.get(key);
    const raw = summary ? (measure === 'revenue' ? summary.totalIncome : summary.result) : 0;
    const value = roundToCents(raw);
    const isCurrent = key === currentMonthKey;
    const [year, month] = key.split('-').map(Number);

    return {
      key,
      label: formatReportsMonthLabel(year, month),
      value,
      isCurrent,
      status: statusOf(value, isCurrent, target),
    };
  });

  const closed = months.filter((month) => !month.isCurrent);
  const closedTotal = closed.reduce((sum, month) => sum + month.value, 0);
  // Months are ascending, so ">=" keeps the most recent one on ties.
  const best = closed.reduce<IncomeGoalHistoryMonth | null>(
    (current, month) =>
      month.value > 0 && (!current || month.value >= current.value) ? month : current,
    null,
  );

  return {
    months,
    averagePerMonth: closed.length > 0 ? roundToCents(closedTotal / closed.length) : null,
    bestMonth: best ? { key: best.key, label: best.label, value: best.value } : null,
    periodTotal: roundToCents(months.reduce((sum, month) => sum + month.value, 0)),
    reached:
      target === null
        ? null
        : { count: closed.filter((month) => month.status === 'REACHED').length, closedMonths: closed.length },
    negative: {
      count: closed.filter((month) => month.status === 'NEGATIVE').length,
      closedMonths: closed.length,
    },
    hasData: months.some((month) => month.value !== 0),
  };
}
