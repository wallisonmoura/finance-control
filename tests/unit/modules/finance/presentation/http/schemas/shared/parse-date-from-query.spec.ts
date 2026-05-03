import { parseDateFromQuery } from '@/modules/finance/presentation/http/schemas/shared/parse-date-from-query';

describe('parseDateFromQuery', () => {
  it('deve converter string YYYY-MM-DD para Date local', () => {
    const result = parseDateFromQuery('2026-03-23');

    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(23);
  });

  it('deve respeitar o mês como base zero no Date', () => {
    const result = parseDateFromQuery('2026-01-15');

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
  });
});
