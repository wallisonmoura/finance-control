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

  it('deve aceitar payload válido de atualização de dívida', () => {
    const result = updateDebtSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('deve aceitar payload válido sem notes', () => {
    const { notes, ...payloadWithoutNotes } = validPayload;

    const result = updateDebtSchema.safeParse(payloadWithoutNotes);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });

  it('deve converter amount string numérica para number', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      amount: '650.25',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.amount).toBe(650.25);
    }
  });

  it('deve aceitar dívida única', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      type: DebtType.ONE_TIME,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.type).toBe(DebtType.ONE_TIME);
    }
  });

  it('deve rejeitar description ausente', () => {
    const { description, ...payloadWithoutDescription } = validPayload;

    const result = updateDebtSchema.safeParse(payloadWithoutDescription);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description que não seja string', () => {
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

  it('deve rejeitar description vazia', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      description: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description apenas com espaços', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      description: '   ',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Descrição é obrigatória.');
    }
  });

  it('deve rejeitar description acima de 255 caracteres', () => {
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

  it('deve rejeitar amount inválido', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      amount: 0,
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar dueDate inválida', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      dueDate: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar type ausente', () => {
    const { type, ...payloadWithoutType } = validPayload;

    const result = updateDebtSchema.safeParse(payloadWithoutType);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tipo de dívida inválido.');
    }
  });

  it('deve rejeitar type inválido', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      type: 'INVALID',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tipo de dívida inválido.');
    }
  });

  it('deve rejeitar notes que não seja string', () => {
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

  it('deve rejeitar notes acima de 1000 caracteres', () => {
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

  it('deve rejeitar campos extras', () => {
    const result = updateDebtSchema.safeParse({
      ...validPayload,
      paidAt: '2026-04-15',
    });

    expect(result.success).toBe(false);
  });
});
