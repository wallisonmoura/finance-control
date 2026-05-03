/* eslint-disable @typescript-eslint/no-unused-vars */
import { updateIncomeSchema } from '@/modules/finance/presentation/http/schemas/update-income.schema';

describe('updateIncomeSchema', () => {
  const validPayload = {
    amount: 180.5,
    description: 'Venda atualizada',
    date: '2026-03-24',
    notes: 'ajuste',
  };

  it('deve aceitar payload válido de atualização de receita', () => {
    const result = updateIncomeSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('deve aceitar payload válido sem notes', () => {
    const { notes, ...payloadWithoutNotes } = validPayload;

    const result = updateIncomeSchema.safeParse(payloadWithoutNotes);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });

  it('deve converter amount string numérica para number', () => {
    const result = updateIncomeSchema.safeParse({
      ...validPayload,
      amount: '180.50',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.amount).toBe(180.5);
    }
  });

  it('deve rejeitar amount inválido', () => {
    const result = updateIncomeSchema.safeParse({
      ...validPayload,
      amount: 0,
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar description ausente', () => {
    const { description, ...payloadWithoutDescription } = validPayload;

    const result = updateIncomeSchema.safeParse(payloadWithoutDescription);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description vazia', () => {
    const result = updateIncomeSchema.safeParse({
      ...validPayload,
      description: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description apenas com espaços', () => {
    const result = updateIncomeSchema.safeParse({
      ...validPayload,
      description: '   ',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description acima de 255 caracteres', () => {
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

  it('deve rejeitar date inválida', () => {
    const result = updateIncomeSchema.safeParse({
      ...validPayload,
      date: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar notes que não seja string', () => {
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

  it('deve rejeitar notes acima de 1000 caracteres', () => {
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

  it('deve rejeitar campos extras', () => {
    const result = updateIncomeSchema.safeParse({
      ...validPayload,
      categoryId: '4d1af925-d603-4db1-9dde-5c56505101fc',
    });

    expect(result.success).toBe(false);
  });
});
