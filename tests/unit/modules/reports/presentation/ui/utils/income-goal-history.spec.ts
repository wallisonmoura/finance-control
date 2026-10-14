import { MonthlySummaryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';
import { buildIncomeGoalHistory } from '@/modules/reports/presentation/ui/utils/income-goal-history';

const KEYS = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];

function summary(key: string, totalIncome: number, totalExpense: number): MonthlySummaryUi {
  const [year, month] = key.split('-').map(Number);
  return { year, month, totalIncome, totalExpense, result: totalIncome - totalExpense };
}

const SUMMARIES = [
  summary('2026-05', 5000, 2500), // profit 2500
  summary('2026-06', 6200, 4000), // profit 2200
  summary('2026-07', 4457.01, 5355.23), // profit -898.22
  summary('2026-08', 0, 0),
  summary('2026-09', 4317.79, 4327.15), // profit -9.36
  summary('2026-10', 1000, 200), // current, profit 800
];

function build(measure: 'revenue' | 'profit', target: number | null) {
  return buildIncomeGoalHistory({
    summaries: SUMMARIES,
    monthKeys: KEYS,
    measure,
    target,
    currentMonthKey: '2026-10',
  });
}

describe('buildIncomeGoalHistory', () => {
  it('should use total income as the revenue of each month', () => {
    expect(build('revenue', null).months.map((m) => m.value)).toEqual([
      5000, 6200, 4457.01, 0, 4317.79, 1000,
    ]);
  });

  it('should use the result as the profit of each month', () => {
    expect(build('profit', null).months.map((m) => m.value)).toEqual([
      2500, 2200, -898.22, 0, -9.36, 800,
    ]);
  });

  it('should mark the current month as CURRENT even above the goal', () => {
    const current = build('revenue', 500).months[5];
    expect(current).toMatchObject({ isCurrent: true, status: 'CURRENT', label: 'out/26' });
  });

  it('should mark closed months as REACHED, BELOW or NEGATIVE against the goal', () => {
    expect(build('profit', 2200).months.map((m) => m.status)).toEqual([
      'REACHED', 'REACHED', 'NEGATIVE', 'BELOW', 'NEGATIVE', 'CURRENT',
    ]);
  });

  it('should mark closed months as NONE without a goal, but keep NEGATIVE', () => {
    expect(build('profit', null).months.map((m) => m.status)).toEqual([
      'NONE', 'NONE', 'NEGATIVE', 'NONE', 'NEGATIVE', 'CURRENT',
    ]);
  });

  it('should average only closed months, counting empty ones', () => {
    // (5000 + 6200 + 4457.01 + 0 + 4317.79) / 5
    expect(build('revenue', null).averagePerMonth).toBe(3994.96);
  });

  it('should allow a negative profit average', () => {
    // (2500 + 2200 - 898.22 + 0 - 9.36) / 5
    expect(build('profit', null).averagePerMonth).toBe(758.48);
    const allNegative = buildIncomeGoalHistory({
      summaries: [summary('2026-09', 0, 100), summary('2026-10', 0, 0)],
      monthKeys: ['2026-09', '2026-10'],
      measure: 'profit',
      target: null,
      currentMonthKey: '2026-10',
    });
    expect(allNegative.averagePerMonth).toBe(-100);
    expect(allNegative.bestMonth).toBeNull();
  });

  it('should pick the best closed month, the most recent on ties, ignoring the current one', () => {
    expect(build('revenue', null).bestMonth).toEqual({ key: '2026-06', label: 'jun/26', value: 6200 });
    const tie = buildIncomeGoalHistory({
      summaries: [summary('2026-08', 300, 0), summary('2026-09', 300, 0), summary('2026-10', 9000, 0)],
      monthKeys: ['2026-08', '2026-09', '2026-10'],
      measure: 'revenue',
      target: null,
      currentMonthKey: '2026-10',
    });
    expect(tie.bestMonth?.key).toBe('2026-09');
  });

  it('should include the current month in the period total', () => {
    expect(build('revenue', null).periodTotal).toBe(20974.8);
  });

  it('should count reached closed months only with a goal', () => {
    expect(build('profit', 2200).reached).toEqual({ count: 2, closedMonths: 5 });
    expect(build('profit', null).reached).toBeNull();
  });

  it('should count closed months in the red', () => {
    expect(build('profit', null).negative).toEqual({ count: 2, closedMonths: 5 });
    expect(build('revenue', null).negative).toEqual({ count: 0, closedMonths: 5 });
  });

  it('should zero-fill months missing from the summaries', () => {
    const history = buildIncomeGoalHistory({
      summaries: [summary('2026-10', 100, 0)],
      monthKeys: ['2026-09', '2026-10'],
      measure: 'revenue',
      target: null,
      currentMonthKey: '2026-10',
    });
    expect(history.months.map((m) => m.value)).toEqual([0, 100]);
  });

  it('should report no data when every month is zero', () => {
    const empty = buildIncomeGoalHistory({
      summaries: [summary('2026-09', 0, 0), summary('2026-10', 0, 0)],
      monthKeys: ['2026-09', '2026-10'],
      measure: 'profit',
      target: 1000,
      currentMonthKey: '2026-10',
    });
    expect(empty.hasData).toBe(false);
    expect(build('profit', null).hasData).toBe(true);
  });

  it('should label months across a year turn', () => {
    const history = buildIncomeGoalHistory({
      summaries: [],
      monthKeys: ['2025-12', '2026-01'],
      measure: 'revenue',
      target: null,
      currentMonthKey: '2026-01',
    });
    expect(history.months.map((m) => [m.label, m.isCurrent])).toEqual([
      ['dez/25', false],
      ['jan/26', true],
    ]);
  });
});
