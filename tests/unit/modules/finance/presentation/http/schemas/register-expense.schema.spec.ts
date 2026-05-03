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

  it('deve aceitar payload válido de despesa', () => {
    const result = registerExpenseSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('deve aceitar payload válido sem notes', () => {
    const { notes, ...payloadWithoutNotes } = validPayload;

    const result = registerExpenseSchema.safeParse(payloadWithoutNotes);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });

  it('deve converter amount string numérica para number', () => {
    const result = registerExpenseSchema.safeParse({
      ...validPayload,
      amount: '50.75',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.amount).toBe(50.75);
    }
  });

  it('deve rejeitar amount inválido', () => {
    const result = registerExpenseSchema.safeParse({
      ...validPayload,
      amount: 0,
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar description ausente', () => {
    const { description, ...payloadWithoutDescription } = validPayload;

    const result = registerExpenseSchema.safeParse(payloadWithoutDescription);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description vazia', () => {
    const result = registerExpenseSchema.safeParse({
      ...validPayload,
      description: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar date inválida', () => {
    const result = registerExpenseSchema.safeParse({
      ...validPayload,
      date: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar categoryId ausente', () => {
    const { categoryId, ...payloadWithoutCategory } = validPayload;

    const result = registerExpenseSchema.safeParse(payloadWithoutCategory);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Categoria é obrigatória para despesa.',
      );
    }
  });

  it('deve rejeitar categoryId inválido', () => {
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

  it('deve rejeitar notes que não seja string', () => {
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

  it('deve rejeitar notes acima de 1000 caracteres', () => {
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

  it('deve rejeitar campos extras', () => {
    const result = registerExpenseSchema.safeParse({
      ...validPayload,
      extraField: true,
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar description que não seja string', () => {
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
