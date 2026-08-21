/* eslint-disable @typescript-eslint/no-unused-vars */
import { registerInstallmentDebtSchema } from '@/modules/debts/presentation/http/schemas/register-installment-debt.schema';

describe('registerInstallmentDebtSchema', () => {
  const validPayload = {
    description: 'Cartão Letícia',
    amount: 1000,
    dueDate: '2026-08-29',
    installmentCount: 4,
  };

  it('should accept a valid installment payload', () => {
    const result = registerInstallmentDebtSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('should accept a valid payload with notes', () => {
    const result = registerInstallmentDebtSchema.safeParse({
      ...validPayload,
      notes: 'Loja Magazine',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.notes).toBe('Loja Magazine');
    }
  });

  it('should convert a numeric installmentCount string to a number', () => {
    const result = registerInstallmentDebtSchema.safeParse({
      ...validPayload,
      installmentCount: '4',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.installmentCount).toBe(4);
    }
  });

  it('should reject installmentCount below 2', () => {
    const result = registerInstallmentDebtSchema.safeParse({
      ...validPayload,
      installmentCount: 1,
    });

    expect(result.success).toBe(false);
  });

  it('should reject installmentCount above 12', () => {
    const result = registerInstallmentDebtSchema.safeParse({
      ...validPayload,
      installmentCount: 13,
    });

    expect(result.success).toBe(false);
  });

  it('should reject a non-integer installmentCount', () => {
    const result = registerInstallmentDebtSchema.safeParse({
      ...validPayload,
      installmentCount: 3.5,
    });

    expect(result.success).toBe(false);
  });

  it('should reject a missing description', () => {
    const { description, ...payloadWithoutDescription } = validPayload;

    const result = registerInstallmentDebtSchema.safeParse(payloadWithoutDescription);

    expect(result.success).toBe(false);
  });

  it('should reject an unrecognized extra field', () => {
    const result = registerInstallmentDebtSchema.safeParse({
      ...validPayload,
      type: 'RECURRING',
    });

    expect(result.success).toBe(false);
  });
});
