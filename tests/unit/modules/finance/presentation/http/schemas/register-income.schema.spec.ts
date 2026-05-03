/* eslint-disable @typescript-eslint/no-unused-vars */
import { registerIncomeSchema } from '@/modules/finance/presentation/http/schemas/register-income.schema';

describe('registerIncomeSchema', () => {
  const validPayload = {
    amount: 100.5,
    description: 'Corrida do dia',
    date: '2026-03-23',
    notes: 'Pagamento recebido',
  };

  it('deve aceitar payload válido de receita', () => {
    const result = registerIncomeSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('deve aceitar payload válido sem notes', () => {
    const { notes, ...payloadWithoutNotes } = validPayload;

    const result = registerIncomeSchema.safeParse(payloadWithoutNotes);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });

  it('deve converter amount string numérica para number', () => {
    const result = registerIncomeSchema.safeParse({
      ...validPayload,
      amount: '100.50',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.amount).toBe(100.5);
    }
  });

  it('deve rejeitar amount inválido', () => {
    const result = registerIncomeSchema.safeParse({
      ...validPayload,
      amount: 0,
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar description ausente', () => {
    const { description, ...payloadWithoutDescription } = validPayload;

    const result = registerIncomeSchema.safeParse(payloadWithoutDescription);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description vazia', () => {
    const result = registerIncomeSchema.safeParse({
      ...validPayload,
      description: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description apenas com espaços', () => {
    const result = registerIncomeSchema.safeParse({
      ...validPayload,
      description: '   ',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description acima de 255 caracteres', () => {
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

  it('deve rejeitar date inválida', () => {
    const result = registerIncomeSchema.safeParse({
      ...validPayload,
      date: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar notes que não seja string', () => {
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

  it('deve rejeitar notes acima de 1000 caracteres', () => {
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

  it('deve rejeitar campos extras', () => {
    const result = registerIncomeSchema.safeParse({
      ...validPayload,
      categoryId: '4d1af925-d603-4db1-9dde-5c56505101fc',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar description que não seja string', () => {
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
