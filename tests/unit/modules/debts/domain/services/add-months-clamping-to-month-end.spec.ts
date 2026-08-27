import { addMonthsClampingToMonthEnd } from '@/modules/debts/domain/services/add-months-clamping-to-month-end';

describe('addMonthsClampingToMonthEnd', () => {
  it('should add months keeping the same day of month', () => {
    const result = addMonthsClampingToMonthEnd(
      new Date(Date.UTC(2026, 4, 15)),
      1,
    );

    expect(result.toISOString().slice(0, 10)).toBe('2026-06-15');
  });

  it('should clamp to the last day of a shorter target month', () => {
    const result = addMonthsClampingToMonthEnd(
      new Date(Date.UTC(2026, 0, 31)),
      1,
    );

    expect(result.toISOString().slice(0, 10)).toBe('2026-02-28');
  });

  it('should clamp to Feb 29 on a leap year', () => {
    const result = addMonthsClampingToMonthEnd(
      new Date(Date.UTC(2028, 0, 31)),
      1,
    );

    expect(result.toISOString().slice(0, 10)).toBe('2028-02-29');
  });

  it('should roll over the year when crossing December', () => {
    const result = addMonthsClampingToMonthEnd(
      new Date(Date.UTC(2026, 11, 31)),
      1,
    );

    expect(result.toISOString().slice(0, 10)).toBe('2027-01-31');
  });
});
