import { debtPaymentDateSchema } from '@/modules/debts/presentation/http/schemas/shared/debt-payment-date.schema';

describe('debtPaymentDateSchema', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should reject a date in the future', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00-03:00'));

    const result = debtPaymentDateSchema.safeParse('2026-06-16');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Data não pode ser uma data futura.',
      );
    }
  });

  it("should accept today's date", () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00-03:00'));

    const result = debtPaymentDateSchema.safeParse('2026-06-15');

    expect(result.success).toBe(true);
  });

  it('should accept a past date', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00-03:00'));

    const result = debtPaymentDateSchema.safeParse('2026-06-01');

    expect(result.success).toBe(true);
  });

  it('should still enforce the underlying date-only format rules', () => {
    const result = debtPaymentDateSchema.safeParse('15/06/2026');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Data deve estar no formato YYYY-MM-DD.',
      );
    }
  });
});
