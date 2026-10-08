import { buildCategoryHistory } from '@/modules/reports/presentation/ui/utils/category-history';

const monthKeys = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];

function build(
  entries: { date: string; amount: number }[],
  monthlyLimit: number | null = 1500,
) {
  return buildCategoryHistory({
    entries,
    monthKeys,
    currentMonthKey: '2026-10',
    monthlyLimit,
  });
}

describe('buildCategoryHistory', () => {
  it('should build one zero-filled month per key, marking the current one', () => {
    const history = build([{ date: '2026-07-10', amount: 100 }]);

    expect(history.months.map((month) => [month.key, month.total, month.isCurrent])).toEqual([
      ['2026-05', 0, false],
      ['2026-06', 0, false],
      ['2026-07', 100, false],
      ['2026-08', 0, false],
      ['2026-09', 0, false],
      ['2026-10', 0, true],
    ]);
    expect(history.months[2].label).toBe('jul/26');
  });

  it('should average closed months counting months without spending', () => {
    const history = build([
      { date: '2026-07-10', amount: 1000 },
      { date: '2026-08-10', amount: 500 },
      { date: '2026-10-02', amount: 9000 },
    ]);

    expect(history.averagePerMonth).toBe(300);
  });

  it('should include the current month only in the period total', () => {
    const history = build([
      { date: '2026-09-10', amount: 100 },
      { date: '2026-10-02', amount: 50.5 },
    ]);

    expect(history.periodTotal).toBe(150.5);
  });

  it('should pick the highest closed month, the most recent one on ties', () => {
    const history = build([
      { date: '2026-06-10', amount: 800 },
      { date: '2026-08-10', amount: 800 },
      { date: '2026-10-02', amount: 5000 },
    ]);

    expect(history.highestMonth).toEqual({ key: '2026-08', label: 'ago/26', total: 800 });
  });

  it('should count closed months above the limit, ignoring equal and current', () => {
    const history = build([
      { date: '2026-05-10', amount: 1600 },
      { date: '2026-06-10', amount: 1500 },
      { date: '2026-07-10', amount: 2000 },
      { date: '2026-10-02', amount: 3000 },
    ]);

    expect(history.exceeded).toEqual({ count: 2, closedMonths: 5 });
    expect(history.months.map((month) => month.overLimit)).toEqual([
      true,
      false,
      true,
      false,
      false,
      false,
    ]);
  });

  it('should not compute overruns without a limit', () => {
    const history = build([{ date: '2026-07-10', amount: 9000 }], null);

    expect(history.exceeded).toBeNull();
    expect(history.months.every((month) => !month.overLimit)).toBe(true);
  });

  it('should report no spending and no highest month for an empty window', () => {
    const history = build([]);

    expect(history.hasSpending).toBe(false);
    expect(history.highestMonth).toBeNull();
    expect(history.averagePerMonth).toBe(0);
    expect(history.periodTotal).toBe(0);
  });

  it('should round summed amounts to cents', () => {
    const history = build([
      { date: '2026-07-01', amount: 0.1 },
      { date: '2026-07-02', amount: 0.2 },
    ]);

    expect(history.months[2].total).toBe(0.3);
  });

  it('should ignore entries outside the window', () => {
    expect(build([{ date: '2026-04-30', amount: 999 }]).periodTotal).toBe(0);
  });

  it('should handle a three-month window crossing the year', () => {
    const history = buildCategoryHistory({
      entries: [{ date: '2025-12-15', amount: 200 }],
      monthKeys: ['2025-12', '2026-01', '2026-02'],
      currentMonthKey: '2026-02',
      monthlyLimit: 100,
    });

    expect(history.months[0].label).toBe('dez/25');
    expect(history.averagePerMonth).toBe(100);
    expect(history.exceeded).toEqual({ count: 1, closedMonths: 2 });
  });
});
