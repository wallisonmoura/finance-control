/* eslint-disable @typescript-eslint/no-unused-vars */
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { payDebtSchema } from '@/modules/debts/presentation/http/schemas/pay-debt.schema';

describe('payDebtSchema', () => {
  const validPayload = {
    paidAt: '2026-04-10',
    expenseCategoryId: '4d1af925-d603-4db1-9dde-5c56505101fc',
    paymentSource: DebtPaymentSource.BANK,
  };

  it('should accept a valid debt payment payload with BANK', () => {
    const result = payDebtSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('should accept paymentSource CASH', () => {
    const result = payDebtSchema.safeParse({
      ...validPayload,
      paymentSource: DebtPaymentSource.CASH,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.paymentSource).toBe(DebtPaymentSource.CASH);
    }
  });

  it('should accept paymentSource RECEIVABLE', () => {
    const result = payDebtSchema.safeParse({
      ...validPayload,
      paymentSource: DebtPaymentSource.RECEIVABLE,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.paymentSource).toBe(DebtPaymentSource.RECEIVABLE);
    }
  });

  it('should reject a missing paidAt', () => {
    const { paidAt, ...payloadWithoutPaidAt } = validPayload;

    const result = payDebtSchema.safeParse(payloadWithoutPaidAt);

    expect(result.success).toBe(false);
  });

  it('should reject an invalid paidAt', () => {
    const result = payDebtSchema.safeParse({
      ...validPayload,
      paidAt: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('should reject paidAt with a full datetime', () => {
    const result = payDebtSchema.safeParse({
      ...validPayload,
      paidAt: '2026-04-10T10:00:00Z',
    });

    expect(result.success).toBe(false);
  });

  it('should reject a missing expenseCategoryId', () => {
    const { expenseCategoryId, ...payloadWithoutCategory } = validPayload;

    const result = payDebtSchema.safeParse(payloadWithoutCategory);

    expect(result.success).toBe(false);
  });

  it('should reject an invalid expenseCategoryId', () => {
    const result = payDebtSchema.safeParse({
      ...validPayload,
      expenseCategoryId: 'category-1',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Categoria de despesa inválida.',
      );
    }
  });

  it('should reject a missing paymentSource', () => {
    const { paymentSource, ...payloadWithoutPaymentSource } = validPayload;

    const result = payDebtSchema.safeParse(payloadWithoutPaymentSource);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Origem do pagamento inválida.',
      );
    }
  });

  it('should reject an invalid paymentSource', () => {
    const result = payDebtSchema.safeParse({
      ...validPayload,
      paymentSource: 'PIX',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Origem do pagamento inválida.',
      );
    }
  });

  it('should reject extra fields', () => {
    const result = payDebtSchema.safeParse({
      ...validPayload,
      amount: 100,
    });

    expect(result.success).toBe(false);
  });
});
