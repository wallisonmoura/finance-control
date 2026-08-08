import {
  parseDateFromQuery,
  parseExclusiveEndDateFromQuery,
} from '@/modules/finance/presentation/http/schemas/shared/parse-date-from-query';

describe('parseDateFromQuery', () => {
  it('should convert YYYY-MM-DD string to Date in UTC', () => {
    const result = parseDateFromQuery('2026-03-23');

    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2026-03-23T00:00:00.000Z');
  });

  it('should respect zero-based month in the UTC Date', () => {
    const result = parseDateFromQuery('2026-01-15');

    expect(result.toISOString()).toBe('2026-01-15T00:00:00.000Z');
  });

  it('should convert endDate to the next day in UTC', () => {
    const result = parseExclusiveEndDateFromQuery('2026-05-16');

    expect(result.toISOString()).toBe('2026-05-17T00:00:00.000Z');
  });
});
