import { randomUUID } from 'node:crypto';

import { ExpenseCategory } from '@/modules/finance/domain/entities/expense-category.entity';
import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { buildSpendingGoals } from '@/modules/finance/domain/services/spending-goals';

function cat(
  id: string,
  name: string,
  monthlyLimit: number | null,
  isActive = true,
): ExpenseCategory {
  return ExpenseCategory.create({
    id,
    userId: 'user-1',
    name,
    slug: id,
    isActive,
    monthlyLimit,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function expense(amount: number, date: string, categoryId: string): FinancialEntry {
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

const bebida = cat('bebida', 'Bebida alcoólica', 300);

function goalOf(
  entries: FinancialEntry[],
  todayValue = '2026-09-15',
  categories = [bebida],
) {
  return buildSpendingGoals({ categories, entries, todayValue }).goals[0];
}

describe('buildSpendingGoals', () => {
  it('should mark a goal as exceeded when spending passes the limit', () => {
    expect(goalOf([expense(376.69, '2026-09-10', 'bebida')])).toEqual({
      categoryId: 'bebida',
      categoryName: 'Bebida alcoólica',
      limit: 300,
      spent: 376.69,
      usedPercent: 126,
      expectedSoFar: 150,
      projected: 753.38,
      remaining: 0,
      overBy: 76.69,
      status: 'EXCEEDED',
    });
  });

  it('should mark a goal above pace when spending runs ahead of the month', () => {
    expect(goalOf([expense(180, '2026-09-10', 'bebida')])).toMatchObject({
      status: 'ABOVE_PACE',
      expectedSoFar: 150,
      projected: 360,
      remaining: 120,
    });
  });

  it('should keep a goal on track when spending is within the pace', () => {
    expect(goalOf([expense(100, '2026-09-10', 'bebida')])).toMatchObject({
      status: 'ON_TRACK',
      remaining: 200,
      projected: 200,
    });
  });

  it('should treat spending exactly at the limit as on track', () => {
    expect(
      goalOf([expense(300, '2026-09-10', 'bebida')], '2026-09-30'),
    ).toMatchObject({
      status: 'ON_TRACK',
      remaining: 0,
      overBy: 0,
      usedPercent: 100,
    });
  });

  it('should not judge pace before the protection day', () => {
    expect(
      goalOf([expense(180, '2026-09-02', 'bebida')], '2026-09-06'),
    ).toMatchObject({ status: 'ON_TRACK', projected: null });
    expect(
      goalOf([expense(180, '2026-09-02', 'bebida')], '2026-09-07'),
    ).toMatchObject({ status: 'ABOVE_PACE' });
  });

  it('should still flag an exceeded goal before the protection day', () => {
    expect(
      goalOf([expense(320, '2026-09-02', 'bebida')], '2026-09-03'),
    ).toMatchObject({ status: 'EXCEEDED', projected: null });
  });

  it('should ignore income, other categories and entries outside the current month', () => {
    expect(
      goalOf([
        income(999, '2026-09-10'),
        expense(50, '2026-09-10', 'outra'),
        expense(70, '2026-08-31', 'bebida'),
        expense(80, '2026-09-16', 'bebida'),
        expense(40, '2026-09-11', 'bebida'),
      ]),
    ).toMatchObject({ spent: 40 });
  });

  it('should only build goals for active categories with a limit', () => {
    const overview = buildSpendingGoals({
      categories: [
        bebida,
        cat('lazer', 'Lazer', null),
        cat('velha', 'Velha', 500, false),
      ],
      entries: [],
      todayValue: '2026-09-15',
    });

    expect(overview.goals.map((goal) => goal.categoryId)).toEqual(['bebida']);
    expect(overview.availableCategories.map((option) => option.id)).toEqual([
      'lazer',
    ]);
  });

  it('should order goals by severity, then used percent, then name', () => {
    const overview = buildSpendingGoals({
      categories: [
        cat('a', 'Alimentação', 200),
        cat('b', 'Bebida', 300),
        cat('c', 'Combustível', 1500),
        cat('d', 'Delivery', 100),
        cat('e', 'Educação', 100),
      ],
      todayValue: '2026-09-15',
      entries: [
        expense(10, '2026-09-10', 'a'),
        expense(400, '2026-09-10', 'b'),
        expense(900, '2026-09-10', 'c'),
        expense(30, '2026-09-10', 'd'),
        expense(30, '2026-09-10', 'e'),
      ],
    });

    expect(overview.goals.map((goal) => goal.categoryId)).toEqual([
      'b',
      'c',
      'd',
      'e',
      'a',
    ]);
  });

  it('should average spending of closed months that had spending', () => {
    const overview = buildSpendingGoals({
      categories: [bebida, cat('lazer', 'Lazer', null)],
      todayValue: '2026-09-15',
      entries: [
        expense(200, '2026-06-10', 'lazer'),
        expense(400, '2026-08-10', 'lazer'),
        expense(300, '2026-09-10', 'lazer'),
        expense(999, '2026-05-10', 'lazer'),
      ],
    });

    expect(overview.availableCategories).toEqual([
      { id: 'lazer', name: 'Lazer', averageSpent: 300 },
    ]);
    expect(overview.averageByCategoryId).toEqual({ bebida: null, lazer: 300 });
  });

  it('should round summed spending to cents', () => {
    expect(
      goalOf([
        expense(0.1, '2026-09-10', 'bebida'),
        expense(0.2, '2026-09-11', 'bebida'),
      ]),
    ).toMatchObject({ spent: 0.3 });
  });
});
