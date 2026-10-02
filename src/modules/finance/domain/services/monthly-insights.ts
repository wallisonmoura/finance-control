import { roundToCents } from '@/shared/domain/money/round-to-cents';

import { FinancialEntry } from '../entities/financial-entry.entity';
import { FinancialEntryType } from '../enums/financial-entry-type.enum';
import { InsightMonth, InsightPeriods } from './insight-periods';

export const INSIGHT_MIN_CHANGE_PERCENT = 20;
export const INSIGHT_MIN_CHANGE_AMOUNT = 50;
// null = the category could not be resolved (e.g. it no longer exists).
// How to display it is a presentation concern.
type CategoryName = string | null;

export type MonthlyInsight =
  | { kind: 'EXPENSE_TOTAL_COMPARISON'; current: number; previous: number; changePercent: number }
  | { kind: 'TOP_EXPENSE_CATEGORY'; categoryName: CategoryName; amount: number; sharePercent: number }
  | {
      kind: 'EXPENSE_CATEGORY_RISE';
      categoryName: CategoryName;
      current: number;
      previous: number;
      // null = category had no expense in the comparison period
      changePercent: number | null;
      // How much going back to the comparison-period level would save.
      // null for a new category (no previous level to go back to).
      potentialSaving: number | null;
    }
  | { kind: 'EXPENSE_CATEGORY_DROP'; categoryName: CategoryName; current: number; previous: number; changePercent: number }
  | { kind: 'INCOME_TOTAL_COMPARISON'; current: number; previous: number; changePercent: number }
  | { kind: 'INCOME_VS_AVERAGE'; current: number; average: number; monthsCount: number }
  | { kind: 'MONTH_RESULT'; totalIncome: number; totalExpense: number; result: number };

export type MonthlyInsightKind = MonthlyInsight['kind'];

export interface MonthlyInsights {
  comparisonMonth: InsightMonth;
  referenceMonth: InsightMonth;
  isClosedMonth: boolean;
  hasEntries: boolean;
  expenseInsights: MonthlyInsight[];
  incomeInsights: MonthlyInsight[];
}

export interface BuildMonthlyInsightsInput {
  entries: FinancialEntry[];
  categoryNameById: Map<string, string>;
  periods: InsightPeriods;
}

type CategoryChange = {
  categoryName: CategoryName;
  current: number;
  previous: number;
  difference: number;
};

function isWithin(date: Date, start: Date, endExclusive: Date): boolean {
  const time = date.getTime();

  return time >= start.getTime() && time < endExclusive.getTime();
}

function sumAmounts(entries: FinancialEntry[]): number {
  return roundToCents(entries.reduce((sum, entry) => sum + entry.amount, 0));
}

function ofType(entries: FinancialEntry[], type: FinancialEntryType): FinancialEntry[] {
  return entries.filter((entry) => entry.type === type);
}

function changePercent(current: number, previous: number): number {
  return Math.round(((current - previous) / previous) * 100);
}

function totalsByCategory(expenses: FinancialEntry[]): Map<string, number> {
  const totals = new Map<string, number>();

  for (const entry of expenses) {
    const categoryId = entry.categoryId ?? '';
    totals.set(categoryId, (totals.get(categoryId) ?? 0) + entry.amount);
  }

  for (const [categoryId, total] of totals) {
    totals.set(categoryId, roundToCents(total));
  }

  return totals;
}

function isRelevantChange({ current, previous, difference }: CategoryChange): boolean {
  if (Math.abs(difference) < INSIGHT_MIN_CHANGE_AMOUNT) {
    return false;
  }

  if (previous === 0) {
    return true;
  }

  return Math.abs(((current - previous) / previous) * 100) >= INSIGHT_MIN_CHANGE_PERCENT;
}

// Deterministic tie-break; unresolved (null) names sort last.
function compareNames(a: CategoryName, b: CategoryName): number {
  if (a === b) {
    return 0;
  }

  if (a === null) {
    return 1;
  }

  if (b === null) {
    return -1;
  }

  return a.localeCompare(b);
}

function byLargestThenName(
  getMagnitude: (change: CategoryChange) => number,
): (a: CategoryChange, b: CategoryChange) => number {
  return (a, b) =>
    getMagnitude(b) - getMagnitude(a) || compareNames(a.categoryName, b.categoryName);
}

function buildExpenseInsights(
  currentExpenses: FinancialEntry[],
  comparisonExpenses: FinancialEntry[],
  resolveName: (categoryId: string) => CategoryName,
): MonthlyInsight[] {
  const insights: MonthlyInsight[] = [];
  const currentTotal = sumAmounts(currentExpenses);
  const previousTotal = sumAmounts(comparisonExpenses);

  if (currentTotal > 0 && previousTotal > 0) {
    insights.push({
      kind: 'EXPENSE_TOTAL_COMPARISON',
      current: currentTotal,
      previous: previousTotal,
      changePercent: changePercent(currentTotal, previousTotal),
    });
  }

  const currentByCategory = totalsByCategory(currentExpenses);

  if (currentTotal > 0) {
    const [topCategoryId, topAmount] = Array.from(currentByCategory.entries()).sort(
      ([idA, amountA], [idB, amountB]) =>
        amountB - amountA || compareNames(resolveName(idA), resolveName(idB)),
    )[0];

    insights.push({
      kind: 'TOP_EXPENSE_CATEGORY',
      categoryName: resolveName(topCategoryId),
      amount: topAmount,
      sharePercent: Math.round((topAmount / currentTotal) * 100),
    });
  }

  if (previousTotal === 0) {
    return insights;
  }

  const previousByCategory = totalsByCategory(comparisonExpenses);
  const categoryIds = new Set([...currentByCategory.keys(), ...previousByCategory.keys()]);

  const relevantChanges = Array.from(categoryIds)
    .map((categoryId): CategoryChange => {
      const current = currentByCategory.get(categoryId) ?? 0;
      const previous = previousByCategory.get(categoryId) ?? 0;

      return {
        categoryName: resolveName(categoryId),
        current,
        previous,
        difference: roundToCents(current - previous),
      };
    })
    .filter(isRelevantChange);

  const [largestRise] = relevantChanges
    .filter((change) => change.difference > 0)
    .sort(byLargestThenName((change) => change.difference));

  if (largestRise) {
    insights.push({
      kind: 'EXPENSE_CATEGORY_RISE',
      categoryName: largestRise.categoryName,
      current: largestRise.current,
      previous: largestRise.previous,
      changePercent:
        largestRise.previous === 0
          ? null
          : changePercent(largestRise.current, largestRise.previous),
      potentialSaving: largestRise.previous === 0 ? null : largestRise.difference,
    });
  }

  const [largestDrop] = relevantChanges
    .filter((change) => change.difference < 0)
    .sort(byLargestThenName((change) => -change.difference));

  if (largestDrop) {
    insights.push({
      kind: 'EXPENSE_CATEGORY_DROP',
      categoryName: largestDrop.categoryName,
      current: largestDrop.current,
      previous: largestDrop.previous,
      changePercent: changePercent(largestDrop.current, largestDrop.previous),
    });
  }

  return insights;
}

function buildIncomeInsights(
  entries: FinancialEntry[],
  currentEntries: FinancialEntry[],
  comparisonEntries: FinancialEntry[],
  periods: InsightPeriods,
): MonthlyInsight[] {
  const insights: MonthlyInsight[] = [];
  const currentIncome = sumAmounts(ofType(currentEntries, FinancialEntryType.INCOME));
  const previousIncome = sumAmounts(ofType(comparisonEntries, FinancialEntryType.INCOME));

  if (previousIncome > 0) {
    insights.push({
      kind: 'INCOME_TOTAL_COMPARISON',
      current: currentIncome,
      previous: previousIncome,
      changePercent: changePercent(currentIncome, previousIncome),
    });
  }

  const incomes = ofType(entries, FinancialEntryType.INCOME);
  const closedMonthIncomes = periods.closedMonths
    .map((closedMonth) =>
      sumAmounts(
        incomes.filter((entry) =>
          isWithin(entry.date, closedMonth.start, closedMonth.endExclusive),
        ),
      ),
    )
    .filter((total) => total > 0);

  if (closedMonthIncomes.length > 0) {
    insights.push({
      kind: 'INCOME_VS_AVERAGE',
      current: currentIncome,
      average: roundToCents(
        closedMonthIncomes.reduce((sum, total) => sum + total, 0) /
          closedMonthIncomes.length,
      ),
      monthsCount: closedMonthIncomes.length,
    });
  }

  if (currentEntries.length > 0) {
    const totalExpense = sumAmounts(ofType(currentEntries, FinancialEntryType.EXPENSE));

    insights.push({
      kind: 'MONTH_RESULT',
      totalIncome: currentIncome,
      totalExpense,
      result: roundToCents(currentIncome - totalExpense),
    });
  }

  return insights;
}

/**
 * Informative, non-judgmental reading of the current month (spec
 * 2026-09-28-monthly-insights-design.md §3). Returns typed data only —
 * wording and currency formatting belong to the presentation layer.
 */
export function buildMonthlyInsights({
  entries,
  categoryNameById,
  periods,
}: BuildMonthlyInsightsInput): MonthlyInsights {
  const resolveName = (categoryId: string) =>
    categoryNameById.get(categoryId) ?? null;

  const currentEntries = entries.filter((entry) =>
    isWithin(entry.date, periods.currentStart, periods.currentEndExclusive),
  );
  const comparisonEntries = entries.filter((entry) =>
    isWithin(entry.date, periods.comparisonStart, periods.comparisonEndExclusive),
  );

  return {
    comparisonMonth: periods.comparisonMonth,
    referenceMonth: periods.referenceMonth,
    isClosedMonth: periods.isClosedMonth,
    hasEntries: currentEntries.length > 0,
    expenseInsights: buildExpenseInsights(
      ofType(currentEntries, FinancialEntryType.EXPENSE),
      ofType(comparisonEntries, FinancialEntryType.EXPENSE),
      resolveName,
    ),
    incomeInsights: buildIncomeInsights(entries, currentEntries, comparisonEntries, periods),
  };
}
