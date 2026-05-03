import { calculateDailyProfitQuerySchema } from '@/modules/finance/presentation/http/schemas/calculate-daily-profit-query.schema';

describe('calculateDailyProfitQuerySchema', () => {
  it('deve aceitar query válida', () => {
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

  it('deve rejeitar date ausente', () => {
    const result = calculateDailyProfitQuerySchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('deve rejeitar date inválida', () => {
    const result = calculateDailyProfitQuerySchema.safeParse({
      date: '23/03/2026',
    });

    expect(result.success).toBe(false);
  });
});
