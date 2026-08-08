import { dateOnlySchema } from '@/shared/presentation/http/schemas/date-only.schema';

describe('dateOnlySchema', () => {
  it('should accept a valid date in YYYY-MM-DD format', () => {
    const result = dateOnlySchema.safeParse('2026-03-23');

    expect(result.success).toBe(true);
    expect(result.data).toBe('2026-03-23');
  });

  it('should trim whitespace before validating the date', () => {
    const result = dateOnlySchema.safeParse(' 2026-03-23 ');

    expect(result.success).toBe(true);
    expect(result.data).toBe('2026-03-23');
  });

  it('should reject an undefined value', () => {
    const result = dateOnlySchema.safeParse(undefined);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Data é obrigatória.');
    }
  });

  it('should reject a value that is not a string', () => {
    const result = dateOnlySchema.safeParse(123);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Data deve ser uma string.');
    }
  });

  it('should reject a date outside the YYYY-MM-DD format', () => {
    const result = dateOnlySchema.safeParse('23/03/2026');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Data deve estar no formato YYYY-MM-DD.',
      );
    }
  });

  it('should reject a full datetime', () => {
    const result = dateOnlySchema.safeParse('2026-03-23T10:00:00Z');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Data deve estar no formato YYYY-MM-DD.',
      );
    }
  });

  it('should reject a non-existent date', () => {
    const result = dateOnlySchema.safeParse('2026-02-30');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Data inválida.');
    }
  });

  it('should reject an invalid month', () => {
    const result = dateOnlySchema.safeParse('2026-13-01');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Data inválida.');
    }
  });

  it('should reject an invalid day', () => {
    const result = dateOnlySchema.safeParse('2026-04-31');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Data inválida.');
    }
  });
});
