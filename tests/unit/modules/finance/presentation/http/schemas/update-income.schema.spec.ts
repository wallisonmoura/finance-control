/* eslint-disable @typescript-eslint/no-unused-vars */
import { updateIncomeSchema } from '@/modules/finance/presentation/http/schemas/update-income.schema';

describe('updateIncomeSchema', () => {
  const validPayload = {
    amount: 180.5,
    description: 'Venda atualizada',
    date: '2026-03-24',
    notes: 'ajuste',
  };

  it('should accept a valid income update payload', () => {
    const result = updateIncomeSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('should accept a valid payload without notes', () => {
    const { notes, ...payloadWithoutNotes } = validPayload;

    const result = updateIncomeSchema.safeParse(payloadWithoutNotes);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });

  it('should convert numeric amount string to number', () => {
    const result = updateIncomeSchema.safeParse({
      ...validPayload,
      amount: '180.50',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.amount).toBe(180.5);
    }
  });

  it('should reject invalid amount', () => {
    const result = updateIncomeSchema.safeParse({
      ...validPayload,
      amount: 0,
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing description', () => {
    const { description, ...payloadWithoutDescription } = validPayload;

    const result = updateIncomeSchema.safeParse(payloadWithoutDescription);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('should reject empty description', () => {
    const result = updateIncomeSchema.safeParse({
      ...validPayload,
      description: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('should reject description with only spaces', () => {
    const result = updateIncomeSchema.safeParse({
      ...validPayload,
      description: '   ',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('should reject description above 255 characters', () => {
    const result = updateIncomeSchema.safeParse({
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
    const result = updateIncomeSchema.safeParse({
      ...validPayload,
      date: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('should reject a date in the future', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-24T12:00:00-03:00'));

    const result = updateIncomeSchema.safeParse({
      ...validPayload,
      date: '2026-03-25',
    });

    jest.useRealTimers();

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Data não pode ser uma data futura.',
      );
    }
  });

  it('should reject notes that is not a string', () => {
    const result = updateIncomeSchema.safeParse({
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
    const result = updateIncomeSchema.safeParse({
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
    const result = updateIncomeSchema.safeParse({
      ...validPayload,
      categoryId: '4d1af925-d603-4db1-9dde-5c56505101fc',
    });

    expect(result.success).toBe(false);
  });

  it('should reject description that is not a string', () => {
    const result = updateIncomeSchema.safeParse({
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
