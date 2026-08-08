import { financeAmountSchema } from '@/modules/finance/presentation/http/schemas/shared/finance-amount.schema';

describe('financeAmountSchema', () => {
  it('should accept a positive numeric value', () => {
    const result = financeAmountSchema.safeParse(100);

    expect(result.success).toBe(true);
    expect(result.data).toBe(100);
  });

  it('should convert a valid numeric string to number', () => {
    const result = financeAmountSchema.safeParse('100.50');

    expect(result.success).toBe(true);
    expect(result.data).toBe(100.5);
  });

  it('should accept decimal values affected by floating-point imprecision', () => {
    const result = financeAmountSchema.safeParse(0.54);

    expect(result.success).toBe(true);
    expect(result.data).toBe(0.54);
  });

  it('should accept values with two decimal places at the validation limit', () => {
    const result = financeAmountSchema.safeParse(560.55);

    expect(result.success).toBe(true);
    expect(result.data).toBe(560.55);
  });

  it('should reject a zero value', () => {
    const result = financeAmountSchema.safeParse(0);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Valor deve ser maior que zero.',
      );
    }
  });

  it('should reject a negative value', () => {
    const result = financeAmountSchema.safeParse(-10);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Valor deve ser maior que zero.',
      );
    }
  });

  it('should reject a non-numeric value', () => {
    const result = financeAmountSchema.safeParse('abc');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Valor deve ser numérico.');
    }
  });

  it('should reject a value with more than 2 decimal places', () => {
    const result = financeAmountSchema.safeParse(10.999);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Valor deve ter no máximo 2 casas decimais.',
      );
    }
  });

  it('should reject a value above the allowed limit', () => {
    const result = financeAmountSchema.safeParse(1000000000000);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Valor excede o limite permitido.',
      );
    }
  });
});
