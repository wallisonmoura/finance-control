import {
  formatReportsMonthLabel,
  getReportsDateRangeForMonths,
  getReportsMonthKeys,
  getReportsMonthsFromSearchParamsRecord,
  getReportsMonthsFromUrlSearchParams,
} from '@/modules/reports/presentation/ui/utils/reports-period';

jest.mock('@/shared/presentation/ui/lib/date', () => ({
  getCurrentBusinessDateValue: () => '2026-08-22',
}));

describe('reports-period', () => {
  describe('getReportsMonthsFromUrlSearchParams', () => {
    it('should return the requested months when valid', () => {
      const searchParams = new URLSearchParams({ months: '12' });

      expect(getReportsMonthsFromUrlSearchParams(searchParams)).toBe(12);
    });

    it('should default to 6 when months is missing', () => {
      const searchParams = new URLSearchParams();

      expect(getReportsMonthsFromUrlSearchParams(searchParams)).toBe(6);
    });

    it('should default to 6 when months is not one of 3, 6 or 12', () => {
      const searchParams = new URLSearchParams({ months: '4' });

      expect(getReportsMonthsFromUrlSearchParams(searchParams)).toBe(6);
    });
  });

  describe('getReportsMonthsFromSearchParamsRecord', () => {
    it('should return the requested months when valid', () => {
      expect(getReportsMonthsFromSearchParamsRecord({ months: '3' })).toBe(3);
    });

    it('should default to 6 when the value is an array with an invalid entry', () => {
      expect(
        getReportsMonthsFromSearchParamsRecord({ months: ['99'] }),
      ).toBe(6);
    });
  });

  describe('getReportsDateRangeForMonths', () => {
    it('should return the last 6 months window ending on the current month, counting from 2026-08-22', () => {
      expect(getReportsDateRangeForMonths(6)).toEqual({
        startDate: '2026-03-01',
        endDate: '2026-08-31',
      });
    });

    it('should return the last 3 months window', () => {
      expect(getReportsDateRangeForMonths(3)).toEqual({
        startDate: '2026-06-01',
        endDate: '2026-08-31',
      });
    });
  });

  describe('getReportsMonthKeys', () => {
    it('should return ascending YYYY-MM keys for the last 3 months, current month last', () => {
      expect(getReportsMonthKeys(3)).toEqual(['2026-06', '2026-07', '2026-08']);
    });

    it('should roll over the year boundary correctly', () => {
      expect(getReportsMonthKeys(6)).toEqual([
        '2026-03',
        '2026-04',
        '2026-05',
        '2026-06',
        '2026-07',
        '2026-08',
      ]);
    });
  });

  describe('formatReportsMonthLabel', () => {
    it('should format a month as a short pt-BR label with 2-digit year', () => {
      expect(formatReportsMonthLabel(2026, 1)).toBe('jan/26');
    });

    it('should format December correctly', () => {
      expect(formatReportsMonthLabel(2025, 12)).toBe('dez/25');
    });
  });
});
