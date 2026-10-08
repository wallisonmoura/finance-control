import { roundToCents } from '@/shared/domain/money/round-to-cents';

import { formatReportsMonthLabel } from './reports-period';

export type CategoryHistoryEntry = {
  // 'YYYY-MM-DD'
  date: string;
  amount: number;
};

export type CategoryHistoryMonth = {
  // 'YYYY-MM'
  key: string;
  label: string;
  total: number;
  isCurrent: boolean;
  overLimit: boolean;
};

export type CategoryHistory = {
  months: CategoryHistoryMonth[];
  // null only when the window has no closed month.
  averagePerMonth: number | null;
  highestMonth: { key: string; label: string; total: number } | null;
  periodTotal: number;
  // null when the category has no monthly limit.
  exceeded: { count: number; closedMonths: number } | null;
  hasSpending: boolean;
};

function labelOf(key: string): string {
  const [year, month] = key.split('-').map(Number);

  return formatReportsMonthLabel(year, month);
}

/**
 * Month-by-month history of one expense category (spec
 * 2026-10-08-category-history-design.md §3). Only closed months feed the
 * average, the highest month and the overrun count; the current month is
 * partial ("até hoje") and only adds to the period total.
 */
export function buildCategoryHistory({
  entries,
  monthKeys,
  currentMonthKey,
  monthlyLimit,
}: {
  entries: CategoryHistoryEntry[];
  monthKeys: string[];
  currentMonthKey: string;
  monthlyLimit: number | null;
}): CategoryHistory {
  const totals = new Map(monthKeys.map((key) => [key, 0]));

  for (const entry of entries) {
    const key = entry.date.slice(0, 7);

    if (totals.has(key)) {
      totals.set(key, (totals.get(key) ?? 0) + entry.amount);
    }
  }

  const months = monthKeys.map((key): CategoryHistoryMonth => {
    const total = roundToCents(totals.get(key) ?? 0);
    const isCurrent = key === currentMonthKey;

    return {
      key,
      label: labelOf(key),
      total,
      isCurrent,
      overLimit: !isCurrent && monthlyLimit !== null && total > monthlyLimit,
    };
  });

  const closedMonths = months.filter((month) => !month.isCurrent);
  const closedTotal = closedMonths.reduce((sum, month) => sum + month.total, 0);
  // Months are ascending, so ">=" keeps the most recent one on ties.
  const highest = closedMonths.reduce<CategoryHistoryMonth | null>(
    (best, month) =>
      month.total > 0 && (!best || month.total >= best.total) ? month : best,
    null,
  );

  return {
    months,
    averagePerMonth:
      closedMonths.length > 0
        ? roundToCents(closedTotal / closedMonths.length)
        : null,
    highestMonth: highest
      ? { key: highest.key, label: highest.label, total: highest.total }
      : null,
    periodTotal: roundToCents(
      months.reduce((sum, month) => sum + month.total, 0),
    ),
    exceeded:
      monthlyLimit === null
        ? null
        : {
            count: closedMonths.filter((month) => month.overLimit).length,
            closedMonths: closedMonths.length,
          },
    hasSpending: months.some((month) => month.total > 0),
  };
}
