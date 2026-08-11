/* eslint-disable @typescript-eslint/no-unused-vars */
import { updateExpenseSchema } from '@/modules/finance/presentation/http/schemas/update-expense.schema';

describe('updateExpenseSchema', () => {
  const validPayload = {
    amount: 120.75,
    description: 'Despesa atualizada',
    date: '2026-03-24',
    categoryId: '4d1af925-d603-4db1-9dde-5c56505101fc',
    notes: 'ajuste',
  };

  it('should accept a valid expense update payload', () => {
    const result = updateExpenseSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('should accept a valid payload without notes', () => {
    const { notes, ...payloadWithoutNotes } = validPayload;

    const result = updateExpenseSchema.safeParse(payloadWithoutNotes);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });

  it('should convert numeric amount string to number', () => {
    const result = updateExpenseSchema.safeParse({
      ...validPayload,
      amount: '120.75',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.amount).toBe(120.75);
    }
  });

  it('should reject invalid amount', () => {
    const result = updateExpenseSchema.safeParse({
      ...validPayload,
      amount: 0,
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing description', () => {
    const { description, ...payloadWithoutDescription } = validPayload;

    const result = updateExpenseSchema.safeParse(payloadWithoutDescription);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('should reject empty description', () => {
    const result = updateExpenseSchema.safeParse({
      ...validPayload,
      description: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('should reject description with only spaces', () => {
    const result = updateExpenseSchema.safeParse({
      ...validPayload,
      description: '   ',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('should reject description above 255 characters', () => {
    const result = updateExpenseSchema.safeParse({
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
    const result = updateExpenseSchema.safeParse({
      ...validPayload,
      date: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('should reject a date in the future', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-24T12:00:00-03:00'));

    const result = updateExpenseSchema.safeParse({
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

  it('should reject missing categoryId', () => {
    const { categoryId, ...payloadWithoutCategory } = validPayload;

    const result = updateExpenseSchema.safeParse(payloadWithoutCategory);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Categoria é obrigatória para despesa.',
      );
    }
  });

  it('should reject invalid categoryId', () => {
    const result = updateExpenseSchema.safeParse({
      ...validPayload,
      categoryId: 'category-1',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Categoria deve ser um UUID válido.',
      );
    }
  });

  it('should reject notes that is not a string', () => {
    const result = updateExpenseSchema.safeParse({
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
    const result = updateExpenseSchema.safeParse({
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
    const result = updateExpenseSchema.safeParse({
      ...validPayload,
      extraField: true,
    });

    expect(result.success).toBe(false);
  });

  it('should reject description that is not a string', () => {
    const result = updateExpenseSchema.safeParse({
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
