import { calculateDailyProfitQuerySchema } from '@/modules/finance/presentation/http/schemas/calculate-daily-profit-query.schema';

describe('calculateDailyProfitQuerySchema', () => {
  it('should accept a valid query', () => {
    const result = calculateDailyProfitQuerySchema.safeParse({
      date: '2026-03-23',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual({
        date: '2026-03-23',
      });
    }
  });

  it('should reject missing date', () => {
    const result = calculateDailyProfitQuerySchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('should reject invalid date', () => {
    const result = calculateDailyProfitQuerySchema.safeParse({
      date: '23/03/2026',
    });

    expect(result.success).toBe(false);
  });
});
