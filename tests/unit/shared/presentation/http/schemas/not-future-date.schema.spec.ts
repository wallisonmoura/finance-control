import { notFutureDateSchema } from '@/shared/presentation/http/schemas/not-future-date.schema';

describe('notFutureDateSchema', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("should accept today's date in the business timezone (America/Sao_Paulo)", () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00-03:00'));

    const result = notFutureDateSchema.safeParse('2026-06-15');

    expect(result.success).toBe(true);
  });

  it('should accept a past date', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00-03:00'));

    const result = notFutureDateSchema.safeParse('2026-06-10');

    expect(result.success).toBe(true);
  });

  it('should reject a date one day in the future', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00-03:00'));

    const result = notFutureDateSchema.safeParse('2026-06-16');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Data não pode ser uma data futura.',
      );
    }
  });

  it("should not consider a date future when it's still today in São Paulo but already tomorrow in UTC", () => {
    // 22:38 in São Paulo (06/15) is already 01:38 UTC the next day (06/16).
    // If the check compared against UTC instead of the business timezone,
    // "today" (06/15) would be wrongly rejected as future.
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T22:38:00-03:00'));

    const result = notFutureDateSchema.safeParse('2026-06-15');

    expect(result.success).toBe(true);
  });

  it('should still enforce the underlying date-only format rules', () => {
    const result = notFutureDateSchema.safeParse('15/06/2026');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Data deve estar no formato YYYY-MM-DD.',
      );
    }
  });
});
