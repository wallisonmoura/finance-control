import { getInsightPeriods } from '@/modules/finance/domain/services/insight-periods';

function utc(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

describe('getInsightPeriods', () => {
  it('should build current, comparison, closed months and query ranges for a regular day', () => {
    expect(getInsightPeriods('2026-09-15')).toEqual({
      currentStart: utc('2026-09-01'),
      currentEndExclusive: utc('2026-09-16'),
      comparisonStart: utc('2026-08-01'),
      comparisonEndExclusive: utc('2026-08-16'),
      comparisonMonth: { year: 2026, month: 8 },
      referenceMonth: { year: 2026, month: 9 },
      isClosedMonth: false,
      closedMonths: [
        { year: 2026, month: 8, start: utc('2026-08-01'), endExclusive: utc('2026-09-01') },
        { year: 2026, month: 7, start: utc('2026-07-01'), endExclusive: utc('2026-08-01') },
        { year: 2026, month: 6, start: utc('2026-06-01'), endExclusive: utc('2026-07-01') },
      ],
      queryStart: utc('2026-06-01'),
      queryEndExclusive: utc('2026-09-16'),
    });
  });

  it('should clamp the comparison day to the last day of a shorter previous month', () => {
    const periods = getInsightPeriods('2026-10-31');

    expect(periods.comparisonStart).toEqual(utc('2026-09-01'));
    expect(periods.comparisonEndExclusive).toEqual(utc('2026-10-01'));
  });

  it('should clamp to February 28 in a non-leap year', () => {
    expect(getInsightPeriods('2026-03-29').comparisonEndExclusive).toEqual(
      utc('2026-03-01'),
    );
  });

  it('should clamp to February 29 in a leap year', () => {
    expect(getInsightPeriods('2028-03-30').comparisonEndExclusive).toEqual(
      utc('2028-03-01'),
    );
  });

  it('should compare January with December of the previous year', () => {
    const periods = getInsightPeriods('2026-01-10');

    expect(periods.comparisonStart).toEqual(utc('2025-12-01'));
    expect(periods.comparisonEndExclusive).toEqual(utc('2025-12-11'));
    expect(periods.comparisonMonth).toEqual({ year: 2025, month: 12 });
    expect(periods.closedMonths.map(({ year, month }) => ({ year, month }))).toEqual([
      { year: 2025, month: 12 },
      { year: 2025, month: 11 },
      { year: 2025, month: 10 },
    ]);
    expect(periods.queryStart).toEqual(utc('2025-10-01'));
  });

  it('should roll the current exclusive end into the next month on the last day', () => {
    expect(getInsightPeriods('2026-09-30').currentEndExclusive).toEqual(
      utc('2026-10-01'),
    );
  });

  describe('closed month mode', () => {
    it('should use the previous full month as reference and the month before it as comparison', () => {
      expect(getInsightPeriods('2026-10-02', 'closed')).toEqual({
        currentStart: utc('2026-09-01'),
        currentEndExclusive: utc('2026-10-01'),
        comparisonStart: utc('2026-08-01'),
        comparisonEndExclusive: utc('2026-09-01'),
        comparisonMonth: { year: 2026, month: 8 },
        referenceMonth: { year: 2026, month: 9 },
        isClosedMonth: true,
        closedMonths: [
          { year: 2026, month: 8, start: utc('2026-08-01'), endExclusive: utc('2026-09-01') },
          { year: 2026, month: 7, start: utc('2026-07-01'), endExclusive: utc('2026-08-01') },
          { year: 2026, month: 6, start: utc('2026-06-01'), endExclusive: utc('2026-07-01') },
        ],
        queryStart: utc('2026-06-01'),
        queryEndExclusive: utc('2026-10-01'),
      });
    });

    it('should roll back across the year boundary in January', () => {
      const periods = getInsightPeriods('2026-01-05', 'closed');

      expect(periods.referenceMonth).toEqual({ year: 2025, month: 12 });
      expect(periods.comparisonMonth).toEqual({ year: 2025, month: 11 });
      expect(periods.currentStart).toEqual(utc('2025-12-01'));
      expect(periods.comparisonEndExclusive).toEqual(utc('2025-12-01'));
      expect(periods.queryStart).toEqual(utc('2025-09-01'));
    });
  });
});
