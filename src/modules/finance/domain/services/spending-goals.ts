import { roundToCents } from '@/shared/domain/money/round-to-cents';

import { ExpenseCategory } from '../entities/expense-category.entity';
import { FinancialEntry } from '../entities/financial-entry.entity';
import { FinancialEntryType } from '../enums/financial-entry-type.enum';
import { getInsightPeriods } from './insight-periods';

// Before this day of the month, spending is never judged against the pace:
// a handful of days says too little about the month.
export const GOAL_PACE_MIN_DAY = 7;

export type SpendingGoalStatus = 'EXCEEDED' | 'ABOVE_PACE' | 'ON_TRACK';

export interface SpendingGoal {
  categoryId: string;
  categoryName: string;
  limit: number;
  spent: number;
  usedPercent: number;
  expectedSoFar: number;
  // Share of the month already elapsed (day 7 of 31 → 23). Compared with
  // usedPercent to explain an above-pace goal without guessing the future.
  monthElapsedPercent: number;
  remaining: number;
  overBy: number;
  status: SpendingGoalStatus;
}

export interface SpendingGoalCategoryOption {
  id: string;
  name: string;
  averageSpent: number | null;
}

export interface SpendingGoalsOverview {
  goals: SpendingGoal[];
  // Active categories without a goal, offered by the "Nova meta" form.
  availableCategories: SpendingGoalCategoryOption[];
  // Average of the closed months with spending, for the form's hint.
  averageByCategoryId: Record<string, number | null>;
}

const STATUS_ORDER: Record<SpendingGoalStatus, number> = {
  EXCEEDED: 0,
  ABOVE_PACE: 1,
  ON_TRACK: 2,
};

function isWithin(date: Date, start: Date, endExclusive: Date): boolean {
  const time = date.getTime();

  return time >= start.getTime() && time < endExclusive.getTime();
}

function sumByCategory(entries: FinancialEntry[], categoryId: string): number {
  return roundToCents(
    entries
      .filter((entry) => entry.categoryId === categoryId)
      .reduce((sum, entry) => sum + entry.amount, 0),
  );
}

/**
 * Spending goals (spec 2026-10-07-spending-goals-design.md §2): a goal is an
 * active category with a monthly limit, judged by the pace of the current
 * month. Returns data only — wording and colors belong to the presentation
 * layer.
 */
export function buildSpendingGoals({
  categories,
  entries,
  todayValue,
}: {
  categories: ExpenseCategory[];
  entries: FinancialEntry[];
  todayValue: string;
}): SpendingGoalsOverview {
  const periods = getInsightPeriods(todayValue, 'current');
  const dayOfMonth = Number(todayValue.slice(8, 10));
  const paceActive = dayOfMonth >= GOAL_PACE_MIN_DAY;

  const expenses = entries.filter(
    (entry) => entry.type === FinancialEntryType.EXPENSE,
  );
  const currentExpenses = expenses.filter((entry) =>
    isWithin(entry.date, periods.currentStart, periods.currentEndExclusive),
  );
  const activeCategories = categories.filter((category) => category.isActive);

  const averageOf = (categoryId: string): number | null => {
    const monthlyTotals = periods.closedMonths
      .map((month) =>
        sumByCategory(
          expenses.filter((entry) =>
            isWithin(entry.date, month.start, month.endExclusive),
          ),
          categoryId,
        ),
      )
      .filter((total) => total > 0);

    if (monthlyTotals.length === 0) {
      return null;
    }

    return roundToCents(
      monthlyTotals.reduce((sum, total) => sum + total, 0) /
        monthlyTotals.length,
    );
  };

  const goals = activeCategories
    .filter((category) => category.monthlyLimit !== null)
    .map((category): SpendingGoal => {
      const limit = category.monthlyLimit as number;
      const spent = sumByCategory(currentExpenses, category.id);
      const expectedSoFar = roundToCents(limit * periods.monthProgress);

      let status: SpendingGoalStatus = 'ON_TRACK';
      if (spent > limit) {
        status = 'EXCEEDED';
      } else if (paceActive && spent > expectedSoFar) {
        status = 'ABOVE_PACE';
      }

      return {
        categoryId: category.id,
        categoryName: category.name,
        limit,
        spent,
        usedPercent: Math.round((spent / limit) * 100),
        expectedSoFar,
        monthElapsedPercent: Math.round(periods.monthProgress * 100),
        remaining: roundToCents(Math.max(limit - spent, 0)),
        overBy: roundToCents(Math.max(spent - limit, 0)),
        status,
      };
    })
    .sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        b.usedPercent - a.usedPercent ||
        a.categoryName.localeCompare(b.categoryName),
    );

  const averageByCategoryId: Record<string, number | null> = {};
  for (const category of activeCategories) {
    averageByCategoryId[category.id] = averageOf(category.id);
  }

  return {
    goals,
    availableCategories: activeCategories
      .filter((category) => category.monthlyLimit === null)
      .map((category) => ({
        id: category.id,
        name: category.name,
        averageSpent: averageByCategoryId[category.id],
      })),
    averageByCategoryId,
  };
}
