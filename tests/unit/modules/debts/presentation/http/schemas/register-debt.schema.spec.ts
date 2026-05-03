/* eslint-disable @typescript-eslint/no-unused-vars */
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { registerDebtSchema } from '@/modules/debts/presentation/http/schemas/register-debt.schema';

describe('registerDebtSchema', () => {
  const validPayload = {
    description: 'Financiamento do carro',
    amount: 500.75,
    dueDate: '2026-04-10',
    type: DebtType.ONE_TIME,
    notes: 'Parcela única',
  };

  it('deve aceitar payload válido de cadastro de dívida', () => {
    const result = registerDebtSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('deve aceitar payload válido sem notes', () => {
    const { notes, ...payloadWithoutNotes } = validPayload;

    const result = registerDebtSchema.safeParse(payloadWithoutNotes);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });

  it('deve converter amount string numérica para number', () => {
    const result = registerDebtSchema.safeParse({
      ...validPayload,
      amount: '500.75',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.amount).toBe(500.75);
    }
  });

  it('deve aceitar dívida recorrente', () => {
    const result = registerDebtSchema.safeParse({
      ...validPayload,
      type: DebtType.RECURRING,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.type).toBe(DebtType.RECURRING);
    }
  });

  it('deve rejeitar description ausente', () => {
    const { description, ...payloadWithoutDescription } = validPayload;

    const result = registerDebtSchema.safeParse(payloadWithoutDescription);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description que não seja string', () => {
    const result = registerDebtSchema.safeParse({
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

  it('deve rejeitar description vazia', () => {
    const result = registerDebtSchema.safeParse({
      ...validPayload,
      description: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description apenas com espaços', () => {
    const result = registerDebtSchema.safeParse({
      ...validPayload,
      description: '   ',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description acima de 255 caracteres', () => {
    const result = registerDebtSchema.safeParse({
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

  it('deve rejeitar amount inválido', () => {
    const result = registerDebtSchema.safeParse({
      ...validPayload,
      amount: 0,
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar dueDate inválida', () => {
    const result = registerDebtSchema.safeParse({
      ...validPayload,
      dueDate: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar type ausente', () => {
    const { type, ...payloadWithoutType } = validPayload;

    const result = registerDebtSchema.safeParse(payloadWithoutType);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tipo de dívida inválido.');
    }
  });

  it('deve rejeitar type inválido', () => {
    const result = registerDebtSchema.safeParse({
      ...validPayload,
      type: 'INVALID',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tipo de dívida inválido.');
    }
  });

  it('deve rejeitar notes que não seja string', () => {
    const result = registerDebtSchema.safeParse({
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
    const result = registerDebtSchema.safeParse({
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
    const result = registerDebtSchema.safeParse({
      ...validPayload,
      status: 'PAID',
    });

    expect(result.success).toBe(false);
  });
});
