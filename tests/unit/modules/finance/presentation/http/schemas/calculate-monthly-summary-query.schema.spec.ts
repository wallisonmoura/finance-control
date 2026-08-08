import { calculateMonthlySummaryQuerySchema } from '@/modules/finance/presentation/http/schemas/calculate-monthly-summary-query.schema';

describe('calculateMonthlySummaryQuerySchema', () => {
  it('should accept year with 4 digits and month without leading zero', () => {
    const result = calculateMonthlySummaryQuerySchema.safeParse({
      year: '2026',
      month: '3',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual({
        year: '2026',
        month: '3',
      });
    }
  });

  it('should accept month with leading zero', () => {
    const result = calculateMonthlySummaryQuerySchema.safeParse({
      year: '2026',
      month: '03',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.month).toBe('03');
    }
  });

  it('should reject missing year', () => {
    const result = calculateMonthlySummaryQuerySchema.safeParse({
      month: '3',
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing month', () => {
    const result = calculateMonthlySummaryQuerySchema.safeParse({
      year: '2026',
    });

    expect(result.success).toBe(false);
  });

  it('should reject year with fewer than 4 digits', () => {
    const result = calculateMonthlySummaryQuerySchema.safeParse({
      year: '26',
      month: '3',
    });

    expect(result.success).toBe(false);
  });

  it('should reject month lower than 1', () => {
    const result = calculateMonthlySummaryQuerySchema.safeParse({
      year: '2026',
      month: '0',
    });

    expect(result.success).toBe(false);
  });

  it('should reject month greater than 12', () => {
    const result = calculateMonthlySummaryQuerySchema.safeParse({
      year: '2026',
      month: '13',
    });

    expect(result.success).toBe(false);
  });
});
