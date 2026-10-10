import { randomUUID } from 'node:crypto';

import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { IncomeGoal } from '@/modules/finance/domain/entities/income-goal.entity';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { buildIncomeGoals } from '@/modules/finance/domain/services/income-goals';

function goal(revenueTarget: number | null, profitTarget: number | null): IncomeGoal {
  return IncomeGoal.create({
    id: 'goal-1',
    userId: 'user-1',
    revenueTarget,
    profitTarget,
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
    description: 'Receita',
    date: new Date(`${date}T00:00:00.000Z`),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function expense(amount: number, date: string, debtId: string | null = null): FinancialEntry {
  return FinancialEntry.create({
    id: randomUUID(),
    userId: 'user-1',
    type: FinancialEntryType.EXPENSE,
    amount,
    description: 'Despesa',
    date: new Date(`${date}T00:00:00.000Z`),
    categoryId: 'cat-1',
    debtId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function revenueOf(entries: FinancialEntry[], todayValue = '2026-09-15', target = 6000) {
  return buildIncomeGoals({ goal: goal(target, null), entries, todayValue }).revenue;
}

describe('buildIncomeGoals', () => {
  it('should be behind pace when revenue runs below the elapsed share of the month', () => {
    expect(revenueOf([income(2000, '2026-09-10')])).toEqual({
      target: 6000,
      achieved: 2000,
      expectedSoFar: 3000,
      remaining: 4000,
      daysLeft: 16,
      perDay: 250,
      progressPercent: 33,
      exceededBy: 0,
      status: 'BEHIND',
    });
  });

  it('should be on pace when revenue keeps up with the month', () => {
    expect(revenueOf([income(3500, '2026-09-10')])).toMatchObject({
      status: 'ON_PACE',
      remaining: 2500,
      perDay: 156.25,
    });
  });

  it('should be reached exactly at the target and report what passed it', () => {
    expect(revenueOf([income(6000, '2026-09-10')])).toMatchObject({
      status: 'REACHED',
      exceededBy: 0,
      remaining: 0,
      perDay: 0,
      progressPercent: 100,
    });
    expect(revenueOf([income(6500, '2026-09-10')])).toMatchObject({
      status: 'REACHED',
      exceededBy: 500,
    });
  });

  it('should not judge the pace before the protection day', () => {
    expect(revenueOf([], '2026-09-06')).toMatchObject({ status: 'EARLY' });
    expect(revenueOf([], '2026-09-07')).toMatchObject({ status: 'BEHIND' });
  });

  it('should compute a negative profit including paid debts without a negative percent', () => {
    const { profit } = buildIncomeGoals({
      goal: goal(null, 2000),
      entries: [
        income(1000, '2026-09-02'),
        expense(800, '2026-09-05'),
        expense(500, '2026-09-08', 'debt-1'),
      ],
      todayValue: '2026-09-15',
    });

    expect(profit).toMatchObject({
      achieved: -300,
      progressPercent: 0,
      remaining: 2300,
      perDay: 143.75,
      status: 'BEHIND',
    });
  });

  it('should ask for everything that remains on the last day of the month', () => {
    expect(revenueOf([income(5000, '2026-09-10')], '2026-09-30')).toMatchObject({
      daysLeft: 1,
      remaining: 1000,
      perDay: 1000,
    });
  });

  it('should only build the goals that were set', () => {
    const onlyRevenue = buildIncomeGoals({
      goal: goal(6000, null),
      entries: [],
      todayValue: '2026-09-15',
    });

    expect(onlyRevenue.revenue).not.toBeNull();
    expect(onlyRevenue.profit).toBeNull();

    const none = buildIncomeGoals({ goal: null, entries: [], todayValue: '2026-09-15' });
    expect(none.revenue).toBeNull();
    expect(none.profit).toBeNull();
  });

  it('should average closed months that had any entry', () => {
    const { averages } = buildIncomeGoals({
      goal: null,
      todayValue: '2026-09-15',
      entries: [
        income(3000, '2026-06-10'),
        income(5000, '2026-08-10'),
        expense(1000, '2026-08-12'),
        income(9999, '2026-05-10'),
        income(7777, '2026-09-02'),
      ],
    });

    expect(averages).toEqual({ revenue: 4000, profit: 3500 });
  });

  it('should have no averages without history', () => {
    const { averages } = buildIncomeGoals({ goal: null, entries: [], todayValue: '2026-09-15' });

    expect(averages).toEqual({ revenue: null, profit: null });
  });

  it('should ignore entries outside the current month and round to cents', () => {
    expect(
      revenueOf([
        income(999, '2026-08-31'),
        income(0.1, '2026-09-01'),
        income(0.2, '2026-09-02'),
        income(500, '2026-09-16'),
      ]),
    ).toMatchObject({ achieved: 0.3 });
  });
});
