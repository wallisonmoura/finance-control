/* eslint-disable @typescript-eslint/no-unused-vars */
import { registerExpenseSchema } from '@/modules/finance/presentation/http/schemas/register-expense.schema';

describe('registerExpenseSchema', () => {
  const validPayload = {
    amount: 50.75,
    description: 'Combustível',
    date: '2026-03-23',
    categoryId: '4d1af925-d603-4db1-9dde-5c56505101fc',
    notes: 'Posto',
  };

  it('should accept a valid expense payload', () => {
    const result = registerExpenseSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('should accept a valid payload without notes', () => {
    const { notes, ...payloadWithoutNotes } = validPayload;

    const result = registerExpenseSchema.safeParse(payloadWithoutNotes);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });

  it('should convert numeric amount string to number', () => {
    const result = registerExpenseSchema.safeParse({
      ...validPayload,
      amount: '50.75',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.amount).toBe(50.75);
    }
  });

  it('should reject invalid amount', () => {
    const result = registerExpenseSchema.safeParse({
      ...validPayload,
      amount: 0,
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing description', () => {
    const { description, ...payloadWithoutDescription } = validPayload;

    const result = registerExpenseSchema.safeParse(payloadWithoutDescription);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('should reject empty description', () => {
    const result = registerExpenseSchema.safeParse({
      ...validPayload,
      description: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('should reject invalid date', () => {
    const result = registerExpenseSchema.safeParse({
      ...validPayload,
      date: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing categoryId', () => {
    const { categoryId, ...payloadWithoutCategory } = validPayload;

    const result = registerExpenseSchema.safeParse(payloadWithoutCategory);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Categoria é obrigatória para despesa.',
      );
    }
  });

  it('should reject invalid categoryId', () => {
    const result = registerExpenseSchema.safeParse({
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
    const result = registerExpenseSchema.safeParse({
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
    const result = registerExpenseSchema.safeParse({
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
    const result = registerExpenseSchema.safeParse({
      ...validPayload,
      extraField: true,
    });

    expect(result.success).toBe(false);
  });

  it('should reject description that is not a string', () => {
    const result = registerExpenseSchema.safeParse({
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
