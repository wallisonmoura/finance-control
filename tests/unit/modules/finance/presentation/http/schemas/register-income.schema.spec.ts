/* eslint-disable @typescript-eslint/no-unused-vars */
import { registerIncomeSchema } from '@/modules/finance/presentation/http/schemas/register-income.schema';

describe('registerIncomeSchema', () => {
  const validPayload = {
    amount: 100.5,
    description: 'Corrida do dia',
    date: '2026-03-23',
    notes: 'Pagamento recebido',
  };

  it('should accept a valid income payload', () => {
    const result = registerIncomeSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('should accept a valid payload without notes', () => {
    const { notes, ...payloadWithoutNotes } = validPayload;

    const result = registerIncomeSchema.safeParse(payloadWithoutNotes);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });

  it('should convert numeric amount string to number', () => {
    const result = registerIncomeSchema.safeParse({
      ...validPayload,
      amount: '100.50',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.amount).toBe(100.5);
    }
  });

  it('should reject invalid amount', () => {
    const result = registerIncomeSchema.safeParse({
      ...validPayload,
      amount: 0,
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing description', () => {
    const { description, ...payloadWithoutDescription } = validPayload;

    const result = registerIncomeSchema.safeParse(payloadWithoutDescription);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('should reject empty description', () => {
    const result = registerIncomeSchema.safeParse({
      ...validPayload,
      description: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('should reject description with only spaces', () => {
    const result = registerIncomeSchema.safeParse({
      ...validPayload,
      description: '   ',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('should reject description above 255 characters', () => {
    const result = registerIncomeSchema.safeParse({
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

  it('should reject invalid date', () => {
    const result = registerIncomeSchema.safeParse({
      ...validPayload,
      date: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('should reject notes that is not a string', () => {
    const result = registerIncomeSchema.safeParse({
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

  it('should reject notes above 1000 characters', () => {
    const result = registerIncomeSchema.safeParse({
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
    const result = registerIncomeSchema.safeParse({
      ...validPayload,
      categoryId: '4d1af925-d603-4db1-9dde-5c56505101fc',
    });

    expect(result.success).toBe(false);
  });

  it('should reject description that is not a string', () => {
    const result = registerIncomeSchema.safeParse({
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
});
