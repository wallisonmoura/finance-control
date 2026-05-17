import {
  parseDateFromQuery,
  parseExclusiveEndDateFromQuery,
} from '@/modules/finance/presentation/http/schemas/shared/parse-date-from-query';

describe('parseDateFromQuery', () => {
  it('deve converter string YYYY-MM-DD para Date em UTC', () => {
    const result = parseDateFromQuery('2026-03-23');

    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2026-03-23T00:00:00.000Z');
  });

  it('deve respeitar o mes como base zero no Date UTC', () => {
    const result = parseDateFromQuery('2026-01-15');

    expect(result.toISOString()).toBe('2026-01-15T00:00:00.000Z');
  });

  it('deve converter endDate para o proximo dia em UTC', () => {
    const result = parseExclusiveEndDateFromQuery('2026-05-16');

    expect(result.toISOString()).toBe('2026-05-17T00:00:00.000Z');
  });
});
