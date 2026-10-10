import { roundToCents } from '@/shared/domain/money/round-to-cents';

import { FinancialEntry } from '../entities/financial-entry.entity';
import { IncomeGoal } from '../entities/income-goal.entity';
import { FinancialEntryType } from '../enums/financial-entry-type.enum';
import { getInsightPeriods } from './insight-periods';
import { GOAL_PACE_MIN_DAY } from './spending-goals';

export type IncomeGoalStatus = 'REACHED' | 'ON_PACE' | 'BEHIND' | 'EARLY';

export interface IncomeGoalProgress {
  target: number;
  // Profit can be negative (more expenses than income so far).
  achieved: number;
  expectedSoFar: number;
  remaining: number;
  // Calendar days left in the month, including today.
  daysLeft: number;
  perDay: number;
  // Never negative: a negative profit reads as 0%.
  progressPercent: number;
  exceededBy: number;
  status: IncomeGoalStatus;
}

export interface IncomeGoalsOverview {
  revenue: IncomeGoalProgress | null;
  profit: IncomeGoalProgress | null;
  // Average of the 3 closed months that had any entry, for the form hint.
  averages: { revenue: number | null; profit: number | null };
}

type MonthTotals = { revenue: number; profit: number; hasEntries: boolean };

function isWithin(date: Date, start: Date, endExclusive: Date): boolean {
  const time = date.getTime();

  return time >= start.getTime() && time < endExclusive.getTime();
}

function totalsOf(entries: FinancialEntry[]): MonthTotals {
  let revenue = 0;
  let expenses = 0;

  for (const entry of entries) {
    if (entry.type === FinancialEntryType.INCOME) {
      revenue += entry.amount;
    } else {
      // Debt payments are real expenses (RG39), so they lower the profit.
      expenses += entry.amount;
    }
  }

  return {
    revenue: roundToCents(revenue),
    profit: roundToCents(revenue - expenses),
    hasEntries: entries.length > 0,
  };
}

function averageOf(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return roundToCents(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function progressOf({
  target,
  achieved,
  monthProgress,
  dayOfMonth,
  daysInMonth,
}: {
  target: number;
  achieved: number;
  monthProgress: number;
  dayOfMonth: number;
  daysInMonth: number;
}): IncomeGoalProgress {
  const expectedSoFar = roundToCents(target * monthProgress);
  const remaining = roundToCents(Math.max(target - achieved, 0));
  const daysLeft = daysInMonth - dayOfMonth + 1;

  let status: IncomeGoalStatus = 'EARLY';
  if (achieved >= target) {
    status = 'REACHED';
  } else if (achieved >= expectedSoFar) {
    status = 'ON_PACE';
  } else if (dayOfMonth >= GOAL_PACE_MIN_DAY) {
    status = 'BEHIND';
  }

  return {
    target,
    achieved,
    expectedSoFar,
    remaining,
    daysLeft,
    perDay: roundToCents(remaining / daysLeft),
    progressPercent: Math.round((Math.max(achieved, 0) / target) * 100),
    exceededBy: roundToCents(Math.max(achieved - target, 0)),
    status,
  };
}

/**
 * Income goals (spec 2026-10-10-income-goals-design.md §2): fixed monthly
 * targets for revenue and profit, judged by the pace of the current month.
 * Returns data only — wording and colors belong to the presentation layer.
 */
export function buildIncomeGoals({
  goal,
  entries,
  todayValue,
}: {
  goal: IncomeGoal | null;
  entries: FinancialEntry[];
  todayValue: string;
}): IncomeGoalsOverview {
  const periods = getInsightPeriods(todayValue, 'current');
  const [year, month, dayOfMonth] = todayValue.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const current = totalsOf(
    entries.filter((entry) =>
      isWithin(entry.date, periods.currentStart, periods.currentEndExclusive),
    ),
  );
  const closed = periods.closedMonths
    .map((closedMonth) =>
      totalsOf(
        entries.filter((entry) =>
          isWithin(entry.date, closedMonth.start, closedMonth.endExclusive),
        ),
      ),
    )
    .filter((totals) => totals.hasEntries);

  const pace = { monthProgress: periods.monthProgress, dayOfMonth, daysInMonth };
  const revenueTarget = goal?.revenueTarget ?? null;
  const profitTarget = goal?.profitTarget ?? null;

  return {
    revenue:
      revenueTarget === null
        ? null
        : progressOf({ target: revenueTarget, achieved: current.revenue, ...pace }),
    profit:
      profitTarget === null
        ? null
        : progressOf({ target: profitTarget, achieved: current.profit, ...pace }),
    averages: {
      revenue: averageOf(closed.map((totals) => totals.revenue)),
      profit: averageOf(closed.map((totals) => totals.profit)),
    },
  };
}
