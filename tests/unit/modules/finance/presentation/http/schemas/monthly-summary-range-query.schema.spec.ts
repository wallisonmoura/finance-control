import { monthlySummaryRangeQuerySchema } from '@/modules/finance/presentation/http/schemas/monthly-summary-range-query.schema';

describe('monthlySummaryRangeQuerySchema', () => {
  it('should default months to 6 when omitted', () => {
    const result = monthlySummaryRangeQuerySchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.months).toBe(6);
    }
  });

  it('should coerce a numeric string to a number', () => {
    const result = monthlySummaryRangeQuerySchema.safeParse({ months: '12' });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.months).toBe(12);
    }
  });

  it('should accept the minimum of 1 month', () => {
    const result = monthlySummaryRangeQuerySchema.safeParse({ months: '1' });

    expect(result.success).toBe(true);
  });

  it('should accept the maximum of 24 months', () => {
    const result = monthlySummaryRangeQuerySchema.safeParse({ months: '24' });

    expect(result.success).toBe(true);
  });

  it('should reject months below 1', () => {
    const result = monthlySummaryRangeQuerySchema.safeParse({ months: '0' });

    expect(result.success).toBe(false);
  });

  it('should reject months above 24', () => {
    const result = monthlySummaryRangeQuerySchema.safeParse({ months: '25' });

    expect(result.success).toBe(false);
  });

  it('should reject a non-integer months value', () => {
    const result = monthlySummaryRangeQuerySchema.safeParse({ months: '6.5' });

    expect(result.success).toBe(false);
  });
});
