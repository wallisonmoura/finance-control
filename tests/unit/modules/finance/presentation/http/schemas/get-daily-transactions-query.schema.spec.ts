import { getDailyTransactionsQuerySchema } from '@/modules/finance/presentation/http/schemas/get-daily-transactions-query.schema';

describe('getDailyTransactionsQuerySchema', () => {
  it('should accept a valid query', () => {
    const result = getDailyTransactionsQuerySchema.safeParse({
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
    const result = getDailyTransactionsQuerySchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('should reject invalid date', () => {
    const result = getDailyTransactionsQuerySchema.safeParse({
      date: '2026-03-23T10:00:00Z',
    });

    expect(result.success).toBe(false);
  });
});
