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

  it('deve aceitar payload válido de atualização de despesa', () => {
    const result = updateExpenseSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('deve aceitar payload válido sem notes', () => {
    const { notes, ...payloadWithoutNotes } = validPayload;

    const result = updateExpenseSchema.safeParse(payloadWithoutNotes);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });

  it('deve converter amount string numérica para number', () => {
    const result = updateExpenseSchema.safeParse({
      ...validPayload,
      amount: '120.75',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.amount).toBe(120.75);
    }
  });

  it('deve rejeitar amount inválido', () => {
    const result = updateExpenseSchema.safeParse({
      ...validPayload,
      amount: 0,
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar description ausente', () => {
    const { description, ...payloadWithoutDescription } = validPayload;

    const result = updateExpenseSchema.safeParse(payloadWithoutDescription);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description vazia', () => {
    const result = updateExpenseSchema.safeParse({
      ...validPayload,
      description: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description apenas com espaços', () => {
    const result = updateExpenseSchema.safeParse({
      ...validPayload,
      description: '   ',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description acima de 255 caracteres', () => {
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

  it('deve rejeitar date inválida', () => {
    const result = updateExpenseSchema.safeParse({
      ...validPayload,
      date: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar categoryId ausente', () => {
    const { categoryId, ...payloadWithoutCategory } = validPayload;

    const result = updateExpenseSchema.safeParse(payloadWithoutCategory);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Categoria é obrigatória para despesa.',
      );
    }
  });

  it('deve rejeitar categoryId inválido', () => {
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

  it('deve rejeitar notes que não seja string', () => {
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

  it('deve rejeitar notes acima de 1000 caracteres', () => {
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

  it('deve rejeitar campos extras', () => {
    const result = updateExpenseSchema.safeParse({
      ...validPayload,
      extraField: true,
    });

    expect(result.success).toBe(false);
  });
});
