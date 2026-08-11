/* eslint-disable @typescript-eslint/no-unused-vars */
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { updateDebtSchema } from '@/modules/debts/presentation/http/schemas/update-debt.schema';

describe('updateDebtSchema', () => {
  const validPayload = {
    description: 'Financiamento atualizado',
    amount: 650.25,
    dueDate: '2026-04-15',
    type: DebtType.RECURRING,
    notes: 'Atualização da parcela',
  };

  it('should accept a valid debt update payload', () => {
    const result = updateDebtSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('should accept a valid payload without notes', () => {
    const { notes, ...payloadWithoutNotes } = validPayload;

    const result = updateDebtSchema.safeParse(payloadWithoutNotes);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });

  it('should convert a numeric amount string to a number', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      amount: '650.25',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.amount).toBe(650.25);
    }
  });

  it('should accept a one-time debt', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      type: DebtType.ONE_TIME,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.type).toBe(DebtType.ONE_TIME);
    }
  });

  it('should reject a missing description', () => {
    const { description, ...payloadWithoutDescription } = validPayload;

    const result = updateDebtSchema.safeParse(payloadWithoutDescription);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('should reject a description that is not a string', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      description: 123,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Descrição deve ser uma string.',
      );
    }
  });

  it('should reject an empty description', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      description: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('should reject a description with only spaces', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      description: '   ',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('should reject a description over 255 characters', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      description: 'a'.repeat(256),
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Descrição deve ter no máximo 255 caracteres.',
      );
    }
  });

  it('should reject an invalid amount', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      amount: 0,
    });

    expect(result.success).toBe(false);
  });

  it('should reject an invalid dueDate', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      dueDate: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('should accept a dueDate in the future, unlike a realized event date', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-01T12:00:00-03:00'));

    const result = updateDebtSchema.safeParse({
      ...validPayload,
      dueDate: '2026-12-31',
    });

    jest.useRealTimers();

    expect(result.success).toBe(true);
  });

  it('should reject a missing type', () => {
    const { type, ...payloadWithoutType } = validPayload;

    const result = updateDebtSchema.safeParse(payloadWithoutType);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tipo de dívida inválido.');
    }
  });

  it('should reject an invalid type', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      type: 'INVALID',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tipo de dívida inválido.');
    }
  });

  it('should reject notes that are not a string', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      notes: 123,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Observações devem ser uma string.',
      );
    }
  });

  it('should reject notes over 1000 characters', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      notes: 'a'.repeat(1001),
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Observações devem ter no máximo 1000 caracteres.',
      );
    }
  });

  it('should reject extra fields', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      paidAt: '2026-04-15',
    });

    expect(result.success).toBe(false);
  });
});
