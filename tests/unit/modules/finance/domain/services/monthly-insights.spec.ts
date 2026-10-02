import { randomUUID } from 'node:crypto';

import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { getInsightPeriods } from '@/modules/finance/domain/services/insight-periods';
import {
  buildMonthlyInsights,
  MonthlyInsight,
  MonthlyInsightKind,
} from '@/modules/finance/domain/services/monthly-insights';

const periods = getInsightPeriods('2026-09-15');

const categoryNameById = new Map([
  ['cat-food', 'Alimentação'],
  ['cat-fun', 'Lazer'],
  ['cat-car', 'Transporte'],
  ['cat-pet', 'Pet'],
  ['cat-bar', 'Bar'],
]);

function expense(amount: number, date: string, categoryId = 'cat-food'): FinancialEntry {
  return FinancialEntry.create({
    id: randomUUID(),
    userId: 'user-1',
    type: FinancialEntryType.EXPENSE,
    amount,
    description: 'Despesa de teste',
    date: new Date(`${date}T00:00:00.000Z`),
    categoryId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function income(amount: number, date: string): FinancialEntry {
  return FinancialEntry.create({
    id: randomUUID(),
    userId: 'user-1',
    type: FinancialEntryType.INCOME,
    amount,
    description: 'Receita de teste',
    date: new Date(`${date}T00:00:00.000Z`),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function build(entries: FinancialEntry[]) {
  return buildMonthlyInsights({ entries, categoryNameById, periods });
}

function find(list: MonthlyInsight[], kind: MonthlyInsightKind) {
  return list.find((insight) => insight.kind === kind);
}

describe('buildMonthlyInsights', () => {
  it('should return no insights when there are no entries', () => {
    expect(build([])).toEqual({
      comparisonMonth: { year: 2026, month: 8 },
      referenceMonth: { year: 2026, month: 9 },
      isClosedMonth: false,
      hasEntries: false,
      expenseInsights: [],
      incomeInsights: [],
    });
  });

  describe('expenses', () => {
    it('should compare the current expense total with the same period of the previous month', () => {
      const result = build([expense(1120, '2026-09-10'), expense(1000, '2026-08-10')]);

      expect(find(result.expenseInsights, 'EXPENSE_TOTAL_COMPARISON')).toEqual({
        kind: 'EXPENSE_TOTAL_COMPARISON',
        current: 1120,
        previous: 1000,
        changePercent: 12,
      });
    });

    it('should ignore previous-month entries after the comparison day', () => {
      const result = build([
        expense(100, '2026-09-05'),
        expense(100, '2026-08-05'),
        expense(500, '2026-08-20'),
      ]);

      expect(find(result.expenseInsights, 'EXPENSE_TOTAL_COMPARISON')).toMatchObject({
        previous: 100,
        changePercent: 0,
      });
    });

    it('should include entries on the first day and on today', () => {
      const result = build([expense(10, '2026-09-01'), expense(20, '2026-09-15')]);

      expect(find(result.expenseInsights, 'TOP_EXPENSE_CATEGORY')).toMatchObject({
        amount: 30,
      });
    });

    it('should ignore entries after today', () => {
      const result = build([expense(10, '2026-09-15'), expense(999, '2026-09-16')]);

      expect(find(result.expenseInsights, 'TOP_EXPENSE_CATEGORY')).toMatchObject({
        amount: 10,
      });
    });

    it('should report the top category with its share of the total', () => {
      const result = build([
        expense(890, '2026-09-10', 'cat-food'),
        expense(1653, '2026-09-11', 'cat-car'),
      ]);

      expect(find(result.expenseInsights, 'TOP_EXPENSE_CATEGORY')).toEqual({
        kind: 'TOP_EXPENSE_CATEGORY',
        categoryName: 'Transporte',
        amount: 1653,
        sharePercent: 65,
      });
    });

    it('should break top category ties by category name', () => {
      const result = build([
        expense(100, '2026-09-10', 'cat-fun'),
        expense(100, '2026-09-10', 'cat-food'),
      ]);

      expect(find(result.expenseInsights, 'TOP_EXPENSE_CATEGORY')).toMatchObject({
        categoryName: 'Alimentação',
      });
    });

    it('should only report the top category when the comparison period has no expenses', () => {
      const result = build([expense(300, '2026-09-10', 'cat-fun')]);

      expect(result.expenseInsights.map((insight) => insight.kind)).toEqual([
        'TOP_EXPENSE_CATEGORY',
      ]);
    });

    it('should report the category with the largest relevant rise', () => {
      const result = build([
        expense(280, '2026-09-10', 'cat-fun'),
        expense(200, '2026-08-10', 'cat-fun'),
        expense(1030, '2026-09-10', 'cat-food'),
        expense(1000, '2026-08-10', 'cat-food'),
      ]);

      expect(find(result.expenseInsights, 'EXPENSE_CATEGORY_RISE')).toEqual({
        kind: 'EXPENSE_CATEGORY_RISE',
        categoryName: 'Lazer',
        current: 280,
        previous: 200,
        changePercent: 40,
        potentialSaving: 80,
      });
    });

    it('should pick the largest absolute rise when several are relevant', () => {
      const result = build([
        expense(280, '2026-09-10', 'cat-fun'),
        expense(200, '2026-08-10', 'cat-fun'),
        expense(600, '2026-09-10', 'cat-car'),
        expense(400, '2026-08-10', 'cat-car'),
      ]);

      expect(find(result.expenseInsights, 'EXPENSE_CATEGORY_RISE')).toMatchObject({
        categoryName: 'Transporte',
      });
    });

    it('should not report a rise that passes the percent but not the amount threshold', () => {
      const result = build([
        expense(40, '2026-09-10', 'cat-bar'),
        expense(10, '2026-08-10', 'cat-bar'),
      ]);

      expect(find(result.expenseInsights, 'EXPENSE_CATEGORY_RISE')).toBeUndefined();
    });

    it('should not report a rise that passes the amount but not the percent threshold', () => {
      const result = build([
        expense(1100, '2026-09-10', 'cat-food'),
        expense(1000, '2026-08-10', 'cat-food'),
      ]);

      expect(find(result.expenseInsights, 'EXPENSE_CATEGORY_RISE')).toBeUndefined();
    });

    it('should report a new category as a rise with null percent when it reaches the amount threshold', () => {
      const result = build([
        expense(150, '2026-09-10', 'cat-pet'),
        expense(100, '2026-08-10', 'cat-food'),
        expense(100, '2026-09-10', 'cat-food'),
      ]);

      expect(find(result.expenseInsights, 'EXPENSE_CATEGORY_RISE')).toEqual({
        kind: 'EXPENSE_CATEGORY_RISE',
        categoryName: 'Pet',
        current: 150,
        previous: 0,
        changePercent: null,
        potentialSaving: null,
      });
    });

    it('should not report a new category below the amount threshold', () => {
      const result = build([
        expense(30, '2026-09-10', 'cat-pet'),
        expense(100, '2026-08-10', 'cat-food'),
        expense(100, '2026-09-10', 'cat-food'),
      ]);

      expect(find(result.expenseInsights, 'EXPENSE_CATEGORY_RISE')).toBeUndefined();
    });

    it('should round the potential saving of a rise to cents', () => {
      const result = build([
        expense(280.3, '2026-09-10', 'cat-fun'),
        expense(200.1, '2026-08-10', 'cat-fun'),
      ]);

      expect(find(result.expenseInsights, 'EXPENSE_CATEGORY_RISE')).toMatchObject({
        potentialSaving: 80.2,
      });
    });

    it('should report the category with the largest relevant drop', () => {
      const result = build([
        expense(300, '2026-09-10', 'cat-car'),
        expense(400, '2026-08-10', 'cat-car'),
      ]);

      expect(find(result.expenseInsights, 'EXPENSE_CATEGORY_DROP')).toEqual({
        kind: 'EXPENSE_CATEGORY_DROP',
        categoryName: 'Transporte',
        current: 300,
        previous: 400,
        changePercent: -25,
      });
    });

    it('should report a drop to zero as -100%', () => {
      const result = build([
        expense(50, '2026-09-10', 'cat-food'),
        expense(400, '2026-08-10', 'cat-car'),
      ]);

      expect(find(result.expenseInsights, 'EXPENSE_CATEGORY_DROP')).toMatchObject({
        categoryName: 'Transporte',
        current: 0,
        changePercent: -100,
      });
    });

    it('should keep expense insights in catalog order', () => {
      const result = build([
        expense(280, '2026-09-10', 'cat-fun'),
        expense(200, '2026-08-10', 'cat-fun'),
        expense(300, '2026-09-10', 'cat-car'),
        expense(400, '2026-08-10', 'cat-car'),
      ]);

      expect(result.expenseInsights.map((insight) => insight.kind)).toEqual([
        'EXPENSE_TOTAL_COMPARISON',
        'TOP_EXPENSE_CATEGORY',
        'EXPENSE_CATEGORY_RISE',
        'EXPENSE_CATEGORY_DROP',
      ]);
    });

    it('should return a null category name when the category is unknown', () => {
      const result = build([expense(100, '2026-09-10', 'cat-deleted')]);

      expect(find(result.expenseInsights, 'TOP_EXPENSE_CATEGORY')).toMatchObject({
        categoryName: null,
      });
    });

    it('should prefer a known category over an unknown one on ties', () => {
      const result = build([
        expense(100, '2026-09-10', 'cat-deleted'),
        expense(100, '2026-09-10', 'cat-fun'),
      ]);

      expect(find(result.expenseInsights, 'TOP_EXPENSE_CATEGORY')).toMatchObject({
        categoryName: 'Lazer',
      });
    });

    it('should round summed amounts to cents', () => {
      const result = build([expense(0.1, '2026-09-10'), expense(0.2, '2026-09-11')]);

      expect(find(result.expenseInsights, 'TOP_EXPENSE_CATEGORY')).toMatchObject({
        amount: 0.3,
      });
    });
  });

  describe('income', () => {
    it('should compare the current income with the same period of the previous month', () => {
      const result = build([income(4200, '2026-09-10'), income(5000, '2026-08-10')]);

      expect(find(result.incomeInsights, 'INCOME_TOTAL_COMPARISON')).toEqual({
        kind: 'INCOME_TOTAL_COMPARISON',
        current: 4200,
        previous: 5000,
        changePercent: -16,
      });
    });

    it('should average only closed months that had income', () => {
      const result = build([
        income(3000, '2026-09-10'),
        income(5000, '2026-06-20'),
        income(6000, '2026-08-20'),
      ]);

      expect(find(result.incomeInsights, 'INCOME_VS_AVERAGE')).toEqual({
        kind: 'INCOME_VS_AVERAGE',
        current: 3000,
        average: 5500,
        monthsCount: 2,
      });
    });

    it('should not report the average when no closed month had income', () => {
      const result = build([income(3000, '2026-09-10')]);

      expect(find(result.incomeInsights, 'INCOME_VS_AVERAGE')).toBeUndefined();
    });

    it('should not include the current month in the average', () => {
      const result = build([income(9000, '2026-09-10'), income(3000, '2026-07-20')]);

      expect(find(result.incomeInsights, 'INCOME_VS_AVERAGE')).toMatchObject({
        average: 3000,
        monthsCount: 1,
      });
    });

    it('should report a negative month result', () => {
      const result = build([income(100, '2026-09-10'), expense(440.5, '2026-09-11')]);

      expect(find(result.incomeInsights, 'MONTH_RESULT')).toEqual({
        kind: 'MONTH_RESULT',
        totalIncome: 100,
        totalExpense: 440.5,
        result: -340.5,
      });
    });

    it('should round the month result to cents', () => {
      const result = build([income(0.1, '2026-09-10'), income(0.2, '2026-09-11')]);

      expect(find(result.incomeInsights, 'MONTH_RESULT')).toMatchObject({
        totalIncome: 0.3,
        result: 0.3,
      });
    });

    it('should keep income insights in catalog order', () => {
      const result = build([
        income(4200, '2026-09-10'),
        income(5000, '2026-08-10'),
        income(5400, '2026-07-10'),
      ]);

      expect(result.hasEntries).toBe(true);
      expect(result.incomeInsights.map((insight) => insight.kind)).toEqual([
        'INCOME_TOTAL_COMPARISON',
        'INCOME_VS_AVERAGE',
        'MONTH_RESULT',
      ]);
    });
  });

  it('should carry the closed-month reference from the periods', () => {
    const closed = buildMonthlyInsights({
      entries: [expense(100, '2026-09-10')],
      categoryNameById,
      periods: getInsightPeriods('2026-10-02', 'closed'),
    });

    expect(closed).toMatchObject({
      referenceMonth: { year: 2026, month: 9 },
      comparisonMonth: { year: 2026, month: 8 },
      isClosedMonth: true,
      hasEntries: true,
    });
  });
});
