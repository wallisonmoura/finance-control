import { isoDateStringSchema } from '@/modules/finance/presentation/http/schemas/shared/date-query.schema';

describe('isoDateStringSchema', () => {
  it('should accept a date in YYYY-MM-DD format', () => {
    const result = isoDateStringSchema.safeParse('2026-03-23');

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toBe('2026-03-23');
    }
  });

  it('should reject a date in DD/MM/YYYY format', () => {
    const result = isoDateStringSchema.safeParse('23/03/2026');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Data deve estar no formato YYYY-MM-DD.',
      );
    }
  });

  it('should reject a full datetime', () => {
    const result = isoDateStringSchema.safeParse('2026-03-23T10:00:00Z');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Data deve estar no formato YYYY-MM-DD.',
      );
    }
  });

  it('should reject a value that is not a string', () => {
    const result = isoDateStringSchema.safeParse(20260323);

    expect(result.success).toBe(false);
  });

  it('should reject a date with a nonexistent month', () => {
    const result = isoDateStringSchema.safeParse('2026-99-99');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Data inválida.');
    }
  });

  it('should reject a date with a day that does not exist in the month', () => {
    const result = isoDateStringSchema.safeParse('2026-02-30');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Data inválida.');
    }
  });
});
